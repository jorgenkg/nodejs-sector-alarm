import { Configuration, default as DefaultConfiguration } from "./config/default.js";
import {
  GetPanelResponse, PanelListResponse, PanelOverviewResponse, SetPanelResponse, UserInfoResponse
} from "./@types/interfaces";
import { URL } from "url";
import got from "got";
import tough from "tough-cookie";

export class SectorApi {
  private VerificationTokenExtractorRegex = /name="__RequestVerificationToken" type="hidden" value="([^"]*)"/;
  private sessionExpiresAt?: Date;

  private configuration: Configuration<true> | Configuration<false>;

  /** Contains an authentication cookie */
  private cookieJar = new tough.CookieJar();

  private email: string;
  private password: string;

  constructor(email: string, password: string, _configuration?: Configuration<true> | Configuration<false>) {
    this.configuration = { ...DefaultConfiguration, ..._configuration };
    this.email = email;
    this.password = password;
  }

  /** Send a REST request to the Sector API */
  private async httpRequest<T, IsHtmlResponse extends boolean = false>({
    endpoint,
    method = "GET",
    body,
    mayReturnHTML = false as IsHtmlResponse,
    isRetry = false
  }: {
    endpoint: Exclude<keyof Configuration["sectorAlarm"]["endpoints"], "login">;
    method?: "POST" | "GET";
    body?: Record<string, unknown>;
    mayReturnHTML?: IsHtmlResponse;
    isRetry?: boolean;
  }): Promise<IsHtmlResponse extends true ? string : T> {

    if(isRetry || !this.sessionExpiresAt || (this.sessionExpiresAt.valueOf() - this.configuration.clock.Date.now()) < 1000 * 60) {
      await this.login();
    }

    const { sectorAlarm: { host, endpoints } } = this.configuration;

    const headers = {
      "Connection": "keep-alive",
      "Pragma": "no-cache",
      "Cache-Control": "no-cache",
      "Accept": "application/json, text/plain, */*",
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 11_1_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36",
      "Content-Type": "application/json;charset=UTF-8",
      "Origin": "https://minside.sectoralarm.no",
      "Sec-Fetch-Site": "same-origin",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Dest": "empty",
      "Referer": "https://minside.sectoralarm.no/",
      "Accept-Language": "nb,en-US;q=0.9,en;q=0.8",
    };

    try {
      if(mayReturnHTML) {
        return await got(
          new URL(endpoints[endpoint], host),
          {
            method,
            cookieJar: this.cookieJar,
            json: body,
            headers
          }
        ).text() as IsHtmlResponse extends true ? string : never;
      }
      else {
        return await got(
          new URL(endpoints[endpoint], host),
          {
            method,
            cookieJar: this.cookieJar,
            json: body,
            headers
          }
        ).json();
      }
    }
    catch(error) {
      if(
        error instanceof got.HTTPError &&
        error.response.statusCode === 401 &&
        error.response.rawBody.toString().includes("ACCOUNT_LOCKED") // seems to be returned if the panel ID is invalid
      ) {
        throw new Error(`Authentication error (${method}). The panel ID might be incorrect. Body: ${error.response.rawBody.toString()}`);
      }
      else if(
        error instanceof got.HTTPError &&
        error.response.statusCode === 401 &&
        !isRetry
      ) {
        // The retrying the request will force a re-authentication which might resolve 401 errors.
        return await this.httpRequest({
          endpoint, method, body, mayReturnHTML, isRetry: true
        });
      }
      else if(error instanceof got.HTTPError && error.response.statusCode === 426) {
        throw new Error("Sector API version updated and no longer compatible");
      }
      else if(error instanceof got.HTTPError) {
        throw new Error(`HTTP error ${method} ${endpoint}: ${error.response.statusCode} ${error.response.rawBody.toString()}`);
      }
      else {
        throw error;
      }
    }
  }

  public async login(): Promise<void> {
    await this.cookieJar.removeAllCookies();

    const { sectorAlarm: { host, endpoints: { login } } } = this.configuration;

    // Make an initial GET request to receive a CSRF token from the Sector API
    const response = await got(
      new URL(login, host),
      { method: "GET", cookieJar: this.cookieJar }
    ).text();

    // Use regex to find the CSRF token in the HTML web page
    const match = this.VerificationTokenExtractorRegex.exec(response);

    if(match === null || match.length !== 2) {
      throw new Error("Couldn't find the login __RequestVerificationToken");
    }

    const [, login__RequestVerificationToken] = match;

    // Perform the actual login
    await got(
      new URL(login, host),
      {
        method: "POST", cookieJar: this.cookieJar,
        form: {
          userID: this.email,
          password: this.password,
          __RequestVerificationToken: login__RequestVerificationToken
        }
      }
    );

    // The login response will always be 200 OK, but the ASPXAUTH cookie will only be set on
    // a successful login.
    const [aspxCookie] = (await this.cookieJar.getCookies(host))
      .filter(cookie => cookie.key === ".ASPXAUTH");

    if(!aspxCookie) {
      throw new Error("Wrong email or password");
    }

    this.sessionExpiresAt = aspxCookie.expiryDate();
    this.configuration.logger.info("Successfully authenticated with the Sector API");
  }

  public async getUserInfo(): Promise<UserInfoResponse> {
    return this.httpRequest<UserInfoResponse>({
      endpoint: "getUserInfo",
      method: "GET"
    });
  }

  public async getPanelList(): Promise<PanelListResponse> {
    return this.httpRequest<PanelListResponse>({
      endpoint: "getPanelList",
      method: "GET"
    });
  }

  public async getPanelOverview(panelId: string): Promise<PanelOverviewResponse> {
    return this.httpRequest<PanelOverviewResponse>({
      endpoint: "getOverview",
      method: "POST",
      body: {
        PanelId: panelId,
        Version: this.configuration.sectorAlarm.version
      }
    });
  }

  public async getPanelDetails(panelId: string): Promise<GetPanelResponse> {
    return this.httpRequest<GetPanelResponse>({
      endpoint: "getPanel",
      method: "POST",
      body: {
        PanelId: panelId,
        Version: this.configuration.sectorAlarm.version
      }
    });
  }

  public async setPanelSettings(
    panelId: string,
    displayName: string,
    quickArm: boolean
  ): Promise<SetPanelResponse> {
    return this.httpRequest<SetPanelResponse>({
      endpoint: "setPanelSettings",
      method: "POST",
      body: {
        displayName,
        panelId: panelId,
        quickArm,
        systemPassword: this.password,
      }
    });
  }

  public async changeAlarmState(panelId: string, command: "Disarm"|"Total"|"Partial", panelCode?: string): Promise<void> {
    if(command === "Disarm" && panelCode === undefined) {
      throw new Error("Panel code must be specified when disarming the alarm");
    }

    const panel = await this.getPanelDetails(panelId);

    if(command === "Partial" && !panel.CanPartialArm) {
      throw new Error("Partial arming not supported");
    }

    if(panelCode === undefined && !panel.QuickArmEnabled) {
      throw new Error("Quick arming not enabled");
    }

    const payload = {
      ArmCmd: command,
      HasLocks: false,
      id: panelId,
      PanelCode: panelCode ? panelCode : "",
    };

    const response = await this.httpRequest<string, true>({
      endpoint: "armPanel",
      method: "POST",
      body: payload,
      mayReturnHTML: true
    });

    if(typeof response === "string" && response.includes("<!DOCTYPE html>")) {
      throw new Error("Communication error");
    }

    const { status } = (JSON.parse(response) as Exclude<SetPanelResponse, string>);

    if(status === "Something went wrong.") {
      throw new Error(`An unknown error occurred at Sector Alarm API: '${status}'. The panel code might be incorrect.`);
    }
    else if(status !== "success") {
      throw Object.assign(new Error("Failed to change the alarm state"), { response });
    }

    this.configuration.logger.info(`Changed state of alarm panel ${panelId} to ${command}`, { panelId, command });
  }
}
