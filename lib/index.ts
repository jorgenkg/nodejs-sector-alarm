import { Configuration, default as DefaultConfiguration } from "./config/default.js";
import {
  GetPanelResponse, PanelListResponse, PanelOverviewResponse, SetPanelResponse, UserInfoResponse
} from "./@types/interfaces";
import got from "got";
import tough from "tough-cookie";
import URL from "url";

export class SectorApi {
  private VerificationTokenExtractorRegex = /name="__RequestVerificationToken" type="hidden" value="([^"]*)"/;

  private sessionExpiresAt?: Date;

  private configuration: Configuration;
  /** Contains an authentication cookie */
  private cookieJar = new tough.CookieJar();
  private email: string;
  private password: string;

  constructor(email: string, password: string, configuration?: Configuration) {
    this.configuration = { ...DefaultConfiguration, ...configuration };
    this.email = email;
    this.password = password;
  }

  public async login(): Promise<void> {
    const { sectorAlarm: { host, endpoints: { login } } } = this.configuration;

    // Make an initial GET request to receive a CSRF token from the Sector API
    const response = await got(
      URL.resolve(host, login),
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
      URL.resolve(host, login),
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

  private async loginIfNecessary(force = false) {
    if(force || !this.sessionExpiresAt || (this.sessionExpiresAt.valueOf() - this.configuration.clock.Date.now()) < 1000 * 60) {
      await this.login();
    }

    // verify session
    const { sectorAlarm: { host, endpoints: { getUserInfo } } } = this.configuration;
    try {
      await got(URL.resolve(host, getUserInfo), { cookieJar: this.cookieJar });
    }
    catch(error) {
      if(error instanceof got.HTTPError && error.response.statusCode === 401) {
        await this.login();
      }
    }
  }

  public async getUserInfo(): Promise<UserInfoResponse> {
    await this.loginIfNecessary();

    const { sectorAlarm: { host, endpoints: { getUserInfo } } } = this.configuration;

    return await got(URL.resolve(host, getUserInfo), { cookieJar: this.cookieJar }).json();
  }

  public async getPanelList(): Promise<PanelListResponse> {
    await this.loginIfNecessary();

    const { sectorAlarm: { host, endpoints: { getPanelList } } } = this.configuration;

    return await got(URL.resolve(host, getPanelList), { cookieJar: this.cookieJar }).json();
  }

  public async getPanelSummary(panelId: string): Promise<PanelOverviewResponse> {
    await this.loginIfNecessary();

    const { sectorAlarm: { host, endpoints: { getOverview } } } = this.configuration;

    return await got(URL.resolve(host, getOverview), {
      method: "POST",
      cookieJar: this.cookieJar,
      json: {
        PanelId: panelId,
        Version: this.configuration.sectorAlarm.version
      }
    }).json();
  }

  public async getPanelDetails(panelId: string): Promise<GetPanelResponse> {
    await this.loginIfNecessary();

    const { sectorAlarm: { host, endpoints: { getPanel } } } = this.configuration;

    return await got(URL.resolve(host, getPanel), {
      method: "POST",
      cookieJar: this.cookieJar,
      json: {
        PanelId: panelId,
        Version: this.configuration.sectorAlarm.version
      }
    }).json();
  }

  public async setPanelSettings(
    panelId: string,
    displayName: string,
    systemPassword: string,
    quickArm: boolean
  ): Promise<SetPanelResponse> {
    await this.loginIfNecessary();

    const { sectorAlarm: { host, endpoints: { setPanelSettings } } } = this.configuration;

    return await got(URL.resolve(host, setPanelSettings), {
      method: "POST",
      cookieJar: this.cookieJar,
      json: {
        PanelId: panelId,
        systemPassword,
        displayName,
        quickArm
      }
    }).text();
  }

  public async changeAlarmState(panelId: string, command: "Disarm"|"Total"|"Partial"|"ArmAnnex"|"DisarmAnnex", panelCode?: string): Promise<void> {
    if((command === "Disarm" || command === "DisarmAnnex") && panelCode === undefined) {
      throw new Error("Panel code must be specified when disarming the alarm");
    }

    await this.loginIfNecessary();

    const panel = await this.getPanelSummary(panelId);

    const { sectorAlarm: { host, endpoints: { armPanel } } } = this.configuration;

    const payload = {
      ArmCmd: command,
      HasLocks: false,
      id: panelId,
      ...(panel.Panel.PanelQuickArm ? {} : { PanelCode: panelCode })
    };

    const response = await got(URL.resolve(host, armPanel), {
      method: "POST",
      cookieJar: this.cookieJar,
      json: payload,
    }).text();

    if(response.includes("<!DOCTYPE html>")) {
      throw new Error("Communication error");
    }

    this.configuration.logger.info(`Changed state of alarm panel ${panelId} to ${command}`, { panelId, command });
  }
}
