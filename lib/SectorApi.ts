import {
  ArmRequest,
  DisarmRequest, LoginRequest, PartialArmRequest, SetPanelSettingsRequest
} from "./@types/requests/index.js";
import { Configuration, default as DefaultConfiguration } from "./config/default.js";
import { deepMerge } from "./misc/deepMerge.js";
import {
  GetPanelListResponse, GetPanelResponse, GetPanelStatusResponse, GetTemperaturesResponse, LoginResponse
} from "./@types/responses/index.js";
import { URL } from "url";
import got from "got";


/**
 * SDK class that expose the Sector Alarm API.
 *
 * Note that `login()` does not need to be called explicitly.
 * The SDK will lazily call `login()` to (re)authenticate when necessary.
 */
export class SectorApi<Test extends boolean = false> {
  #accessToken?: string;
  #accessTokenExpiresAt?: Date;

  #configuration: Configuration<Test>;

  #email: string;
  #password: string;

  /** The generic type parameter should be either omitted or `false` in production. */
  constructor(email: string, password: string, configuration?: Configuration<Test>) {
    this.#configuration = (!configuration ? DefaultConfiguration : deepMerge(DefaultConfiguration, configuration)) as Configuration<Test>;
    this.#email = email;
    this.#password = password;
  }

  /** Send a REST request to the Sector API */
  private async httpRequest<T>({
    endpoint, method = "GET", body, isRetry = false, query
  }: {
    endpoint: Exclude<keyof Configuration["sectorAlarm"]["endpoints"], "login">;
    method?: "POST" | "GET";
    body?: DisarmRequest | LoginRequest | PartialArmRequest | SetPanelSettingsRequest;
    isRetry?: boolean;
    query?: Record<string, string>;
  }): Promise<T> {

    if (isRetry || !this.#accessTokenExpiresAt || (this.#accessTokenExpiresAt.valueOf() - this.#configuration.clock.Date.now()) < 1000 * 60) {
      await this.login();
    }

    const { sectorAlarm: { host, endpoints } } = this.#configuration;

    const response = await got<T>(
      new URL(endpoints[endpoint], host),
      {
        method,
        json: body,
        searchParams: query,
        headers: {
          authorization: this.#accessToken,
          ...this.#configuration.sectorAlarm.additionalHeaders
        },
        resolveBodyOnly: false,
        throwHttpErrors: false,
        retry: { limit: 3 },
        responseType: "json",
        https: { certificateAuthority: this.#configuration.mockData?.ssl.cert }
      }
    );

    if(response.statusCode === 401 && !isRetry) {
      return await this.httpRequest({
        endpoint, method, body, isRetry: true, query
      });
    }
    else if(response.statusCode === 401 && response.rawBody.toString().includes("ACCOUNT_LOCKED")) { // seems to be returned if the panel ID is invalid
      throw new Error(`Authentication error (${method}). The panel ID might be incorrect. Body: ${response.rawBody.toString()}`);
    }
    else if(response.statusCode === 401) {
      throw new Error(`Authentication error (${method}). Body: ${response.rawBody.toString()}`);
    }
    else if(response.statusCode === 426) {
      throw new Error("Sector API version updated and no longer compatible");
    }
    else if(response.statusCode >= 400) {
      throw new Error(`HTTP error ${method} ${endpoint}: ${response.statusCode} ${response.rawBody.toString()}`);
    }

    return response.body;
  }

  /** Authenticate using the credentials specified in the constructor. The login flow emulates a user login and
   * stores the authenticated cookie for subsequent API calls.
   *
   * This function is used internally and does not need to be called directly.
  */
  public async login(): Promise<void> {
    const { sectorAlarm: { host, endpoints: { login } } } = this.#configuration;

    const request: LoginRequest = {
      Password: this.#password,
      UserId: this.#email
    };

    // Perform the actual login
    const response = await got<LoginResponse>(
      new URL(login, host),
      {
        method: "POST",
        json: request,
        resolveBodyOnly: false,
        throwHttpErrors: false,
        headers: {
          authorization: this.#accessToken,
          ...this.#configuration.sectorAlarm.additionalHeaders
        },
        responseType: "json",
        https: { certificateAuthority: this.#configuration.mockData?.ssl.cert },
        retry: { limit: 3 }
      }
    );

    if(response.statusCode === 401) {
      throw new Error(`Authentication error on login. Maybe the credentials are incorrect? Body: ${response.rawBody.toString()}`);
    }
    else if(response.statusCode === 426) {
      throw new Error("Sector API version updated and no longer compatible");
    }
    else if(response.statusCode >= 400) {
      throw new Error(`HTTP error: ${response.statusCode} ${response.rawBody.toString()}`);
    }

    const [, payload ] = response.body.AuthorizationToken.split(".");
    const jsonString = Buffer.from(payload, "base64").toString("utf-8");
    const jsonData = JSON.parse(jsonString) as {
      "https://sectoralarm/email": string;
      iss: string;
      sub: string;
      aud: string;
      iat: number;
      /** seconds since epoch */
      exp: number;
      azp: string;
      gty: string;
    };

    this.#accessToken = response.body.AuthorizationToken;
    this.#accessTokenExpiresAt = new Date((+jsonData.exp) * 1000);
    this.#configuration.logger.info("Successfully authenticated with the Sector API");
  }

  /** Fetch a list of high level information about alarm panels. */
  public async getPanelList(): Promise<GetPanelListResponse> {
    return this.httpRequest<GetPanelListResponse>({ endpoint: "getPanelList" });
  }

  public async getPanelStatus(panelId: string): Promise<GetPanelStatusResponse> {
    return this.httpRequest<GetPanelStatusResponse>({
      endpoint: "getPanelStatus",
      query: { panelId }
    });
  }

  /** Fetch details about the support features of an alarm panel. */
  public async getPanelDetails(panelId: string): Promise<GetPanelResponse> {
    return this.httpRequest<GetPanelResponse>({
      endpoint: "getPanel",
      query: { panelId }
    });
  }

  /** Fetch details about the support features of an alarm panel. */
  public async getTemperatures(panelId: string): Promise<GetTemperaturesResponse> {
    return this.httpRequest<GetTemperaturesResponse>({
      endpoint: "getTemperatures",
      query: { panelId }
    });
  }

  /** Update the name and enable/disable the quick arm capability of an alarm panel. */
  public async setPanelSettings(
    panelId: string,
    displayName: string,
    quickArm: boolean
  ): Promise<void> {
    const request: SetPanelSettingsRequest = {
      Quickarm: quickArm,
      Displayname: displayName,
      PanelId: panelId,
      Password: this.#password
    };

    await this.httpRequest({
      endpoint: "setSettings",
      method: "POST",
      body: request
    });
  }

  /** Change the state of an alarm panel. The function returns once the alarm has confirmed the state change.
   * The call throws if 1) the panel code is incorrect 2) the underlying API version has changed.  */
  public async changeAlarmState(panelId: string, command: "Disarm" | "Total" | "Partial", panelCode?: string): Promise<void> {
    if (command === "Disarm" && panelCode === undefined) {
      throw new Error("Panel code must be specified when disarming the alarm");
    }

    const panel = await this.getPanelDetails(panelId);

    if (panelCode === undefined && !panel.QuickArmEnabled) {
      throw new Error("Quick arming not enabled. Panel code must be specified.");
    }

    const status = await this.getPanelStatus(panelId);

    if(!status.IsOnline) {
      throw new Error("Panel is currently not online.");
    }

    if (command === "Partial" && !panel.CanPartialArm) {
      throw new Error("Partial arming not supported");
    }
    else if(command === "Partial") {
      const partialArmRequest: PartialArmRequest = {
        PanelId: panelId,
        Platform: "app",
        PanelCode: panelCode ? panelCode : "",
      };

      await this.httpRequest({
        endpoint: "partialArm",
        method: "POST",
        body: partialArmRequest
      });
    }
    else if(command === "Disarm") {
      const disarmRequest: DisarmRequest = {
        PanelId: panelId,
        Platform: "app",
        PanelCode: panelCode ?? ""
      };

      await this.httpRequest({
        endpoint: "disarm",
        method: "POST",
        body: disarmRequest
      });
    }
    else if(command === "Total") {
      const armRequest: ArmRequest = {
        PanelId: panelId,
        Platform: "app",
        PanelCode: panelCode ?? ""
      };

      await this.httpRequest({
        endpoint: "totalArm",
        method: "POST",
        body: armRequest
      });
    }

    this.#configuration.logger.info(`Changed state of alarm panel ${panelId} to ${command}`, { panelId, command });
  }
}
