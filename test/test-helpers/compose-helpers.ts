import { SectorApi } from "../../lib/SectorApi.js";
import bodyParser from "koa-bodyparser";
import https from "https";
import Koa from "koa";
import Route from "koa-route";
import tape from "tape";
import util from "util";
import type { Configuration } from "../../lib/@types/Configuration";
import type {
  DisarmRequest, LoginRequest, PartialArmRequest, SetPanelSettingsRequest
} from "../../lib/@types/requests/index.js";
import type {
  GetPanelListResponse, GetPanelResponse, GetPanelStatusResponse, GetTemperaturesResponse, LoginResponse
} from "../../lib/@types/responses/index.js";
import type { Middleware, TestComposer } from "./compose-types.js";


export const compose: TestComposer = (...composers: unknown[]) => {
  const test = composers.pop() as (...args: unknown[]) => Promise<void>;
  const results: unknown[] = [];

  return async function _compose(t: tape.Test): Promise<void> {
    if (composers.length === 0) {
      await test(...results, t);
    }
    else {
      const middleware = composers.shift() as Middleware<unknown>; // leftmost middleware
      await middleware(
        async(result: unknown) => {
          if(result !== undefined) {
            results.push(result);
          }
          await _compose(t);
        }
      );
    }
  };
};

export function withApi(configuration: Configuration<true>, {
  email,
  password,
}: {
  email?: string;
  password?: string;
} = {}): Middleware<SectorApi<true>> {
  return async next => {
    await next(new SectorApi(
      email || configuration.mockData.userID,
      password || configuration.mockData.password,
      configuration
    ));
  };
}

class MockedSectorApi extends Koa {
  // Faked sector alarm formatted access token
  private mockBearerToken?: string;
  private readonly configuration: Configuration<true>;

  private hasLoggedIn = false;

  constructor(config: Configuration<true>, {
    PanelId,
    displayName,
    quickArm,
    userID,
    password,
    panelCode,
  }: Configuration<true>["mockData"]) {
    super();
    this.configuration = config;

    this.use(Route.all("*", async(ctx, path, next: Koa.Next) => {
      try {
        await next();
      }
      catch(error) {
        config.logger.error(util.inspect(error, { breakLength: Infinity, depth: null }));
      }
    }));

    this.use(bodyParser());

    this.use(Route.post(
      this.configuration.sectorAlarm.endpoints.login,
      ctx => {
        const body = ctx.request.body as LoginRequest;

        if(body.Password !== password) {
          ctx.response.status = 400;
          ctx.response.body = { message: "The request did not present a valid password" };
          return;
        }
        else if(body.UserId !== userID) {
          ctx.response.status = 400;
          ctx.response.body = { message: "The request did not present a valid userID" };
          return;
        }

        this.generateNewBearerToken();

        ctx.response.status = 200;
        ctx.response.body = { AuthorizationToken: this.mockBearerToken } as Partial<LoginResponse>;

        this.hasLoggedIn = true;
      }
    ));

    this.use(Route.all("*", async(ctx, path, next: Koa.Next) => {
      if(!this.hasLoggedIn) {
        ctx.response.status = 401;
        ctx.response.message = "not yet authenticated";
        return;
      }
      else if(ctx.headers.authorization !== this.mockBearerToken) {
        ctx.response.status = 401;
        return;
      }

      const [, payload] = ctx.headers.authorization?.split(".") ?? [];
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

      if(new Date((+jsonData.exp) * 1000) < new config.clock.Date()) {
        ctx.response.status = 401;
        ctx.response.body = "token expired";
        return;
      }

      await next();
    }));

    this.use(
      Route.get(this.configuration.sectorAlarm.endpoints.getPanelList, ctx => {
        ctx.response.body = [{
          PanelId: PanelId,
          PanelTime: "1970-01-01T00:00:00",
          IsDefaultPanel: true,
          InstallationStatus: 3,
          AccessGroup: 1,
          DisplayName: displayName,
          LegalOwnerName: "John Smith",
          Status: 1,
          Capabilities: ["CanModifyPanelWhileArmed", "CanScanForWifi", "UseLegacyHomeScreen"]
        }] as GetPanelListResponse;
      })
    );

    this.use(
      Route.get(this.configuration.sectorAlarm.endpoints.getPanel, ctx => {
        if(ctx.query.panelId !== PanelId) {
          ctx.response.status = 400;
          ctx.response.body = { message: "The request did not present a valid PanelId" };
          return;
        }

        ctx.response.body = {
          "PanelCodeLength": 4,
          "LockLanguage": 1,
          "HasAnnex": false,
          "DisplayWizard": false,
          "CanAddDoorLock": false,
          "CanAddSmartplug": true,
          "CanPartialArm": true,
          "QuickArmEnabled": quickArm,
          "SupportsPanelUsers": true,
          "SupportsTemporaryPanelUsers": true,
          "SupportsRegisterDevices": true,
          "InterviewDisplayStatus": false,
          "PreInstallationWizardDone": false,
          "CanChangeInstallationDate": false,
          "ArcVideoConsent": null,
          "WizardStep": 0,
          "PanelId": "123456789",
          "DisplayName": "Foobar name",
          "InstallationAddress": null,
          "InstallationStatus": 3,
          "BookedStartDate": "0001-01-01T00:00:00",
          "BookedEndDate": "0001-01-01T00:00:00",
          "PropertyContact": {
            "AppUserId": "",
            "FirstName": "",
            "LastName": "",
            "PhoneNumber": "",
            "AccessGroup": 3,
            "IsPropertyContact": true,
            "IsInvite": false,
            "AddSmartPlugUserOverride": false
          },
          "Wifi": null,
          "HasVideo": false,
          "Video": 0,
          "Access": ["History", "Directions", "SecurityQuestion", "ContactPersons", "AlarmSystemSettings", "LockSettings", "SmartplugSettings", "Photos", "Smartplugs", "Cameras", "CameraSettings", "PanelUsers", "AddProducts", "AppUserSettings", "PreInstallationSettings", "Wifi", "Booking"],
          "Capabilities": ["CanModifyPanelWhileArmed", "CanScanForWifi", "UseLegacyHomeScreen"],
          "Locks": [],
          "Smartplugs": [],
          "Temperatures": [{
            "Id": null,
            "Label": "foorbar sensor",
            "SerialNo": "1",
            "Temprature": "20",
            "DeviceId": null
          }],
          "Photos": []
        } as GetPanelResponse;
      })
    );

    this.use(
      Route.get(this.configuration.sectorAlarm.endpoints.getPanelStatus, ctx => {
        if(ctx.query.panelId !== PanelId) {
          ctx.response.status = 400;
          ctx.response.body = { message: "The request did not present a valid PanelId" };
          return;
        }

        ctx.response.body = {
          "IsOnline": true,
          "StatusTime": "1970-01-01T00:00:00",
          "Status": 1,
          "AnnexStatus": 0
        } as GetPanelStatusResponse;
      })
    );

    this.use(
      Route.get(this.configuration.sectorAlarm.endpoints.getTemperatures, ctx => {
        if(ctx.query.panelId !== PanelId) {
          ctx.response.status = 400;
          ctx.response.body = { message: "The request did not present a valid PanelId" };
          return;
        }

        ctx.response.body = [{
          "Id": null,
          "Label": "foobar sensor name",
          "SerialNo": "123456789",
          "Temprature": "20",
          "DeviceId": null
        }] as GetTemperaturesResponse;
      })
    );

    this.use(
      Route.post(this.configuration.sectorAlarm.endpoints.totalArm, ctx => {
        const body = ctx.request.body as PartialArmRequest;

        if(body.PanelCode === "" && quickArm !== true) {
          ctx.response.status = 400;
          ctx.response.body = { message: `The request must specify a PanelCode when quick arm isn't enabled: ${JSON.stringify(body)}` };
          return;
        }
        else if(body.PanelCode !== "" && body.PanelCode !== panelCode) {
          ctx.response.status = 400;
          ctx.response.body = { message: `The request did not specify the correct PanelCode ${panelCode}: ${JSON.stringify(body)}` };
          return;
        }
        else if(body.PanelId !== PanelId) {
          ctx.response.status = 400;
          ctx.response.body = { message: `The request specified an incorrect panelID: ${JSON.stringify(body)}` };
          return;
        }
        else if(body.Platform !== "app") {
          ctx.response.status = 400;
          ctx.response.body = { message: `The request specified an incorrect platform name: ${JSON.stringify(body)}` };
          return;
        }

        ctx.response.status = 204;
      })
    );

    this.use(
      Route.post(this.configuration.sectorAlarm.endpoints.partialArm, ctx => {
        const body = ctx.request.body as PartialArmRequest;

        if(body.PanelCode === "" && quickArm !== true) {
          ctx.response.status = 400;
          ctx.response.body = { message: `The request must specify a PanelCode when quick arm isn't enabled: ${JSON.stringify(body)}` };
          return;
        }
        else if(body.PanelCode !== "" && body.PanelCode !== panelCode) {
          ctx.response.status = 400;
          ctx.response.body = { message: `The request did not specify the correct PanelCode ${panelCode}: ${JSON.stringify(body)}` };
          return;
        }
        else if(body.PanelId !== PanelId) {
          ctx.response.status = 400;
          ctx.response.body = { message: `The request specified an incorrect panelID: ${JSON.stringify(body)}` };
          return;
        }
        else if(body.Platform !== "app") {
          ctx.response.status = 400;
          ctx.response.body = { message: `The request specified an incorrect platform name: ${JSON.stringify(body)}` };
          return;
        }

        ctx.response.status = 204;
      })
    );

    this.use(
      Route.post(this.configuration.sectorAlarm.endpoints.disarm, ctx => {
        const body = ctx.request.body as DisarmRequest;

        if(body.PanelCode !== panelCode) {
          ctx.response.status = 400;
          ctx.response.body = { message: `The request did not specify the correct PanelCode ${panelCode}: ${JSON.stringify(body)}` };
          return;
        }
        else if(body.PanelId !== PanelId) {
          ctx.response.status = 400;
          ctx.response.body = { message: `The request specified an incorrect panelID: ${JSON.stringify(body)}` };
          return;
        }
        else if(body.Platform !== "app") {
          ctx.response.status = 400;
          ctx.response.body = { message: `The request specified an incorrect platform name: ${JSON.stringify(body)}` };
          return;
        }

        ctx.response.status = 204;
      })
    );

    this.use(
      Route.post(this.configuration.sectorAlarm.endpoints.setSettings, ctx => {
        const body = ctx.request.body as SetPanelSettingsRequest;

        if(body.PanelId !== PanelId) {
          ctx.response.status = 400;
          ctx.response.body = { message: `The request did not present a valid PanelId: ${JSON.stringify(body)}` };
          return;
        }
        else if(body.Password !== password) {
          ctx.response.status = 403;
          ctx.response.body = { message: `The request did not present a valid systemPassword: ${JSON.stringify(body)}` };
          return;
        }
        else if(!body.Displayname === undefined) {
          ctx.response.status = 400;
          ctx.response.body = { message: `The request did not provide a value for [displayName]: ${JSON.stringify(body)}` };
          return;
        }
        else if(body.Quickarm === undefined) {
          ctx.response.status = 400;
          ctx.response.body = { message: `The request did not provide a value for [quickArm]: ${JSON.stringify(body)}` };
          return;
        }

        ctx.response.status = 204;
      })
    );
  }

  private generateNewBearerToken() {
    this.mockBearerToken = `foo.${
      Buffer.from(JSON.stringify({
        "https://sectoralarm/email": this.configuration.mockData.userID,
        "iss": "https://sectoralarm.eu.auth0.com/",
        "sub": "auth0|foobar",
        "aud": "https://minside.sectoralarm.no",
        "iat": Math.floor(this.configuration.clock.Date.now() / 1000),
        "exp": Math.floor(this.configuration.clock.Date.now() / 1000) + 60 * 60,
        "azp": "foobar",
        "gty": "password"
      }), "utf-8").toString("base64")
    }.bar`;
  }

  public invalidateToken() {
    this.generateNewBearerToken();
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function withMockedSectorApi<T extends boolean = false>(
  configuration: Configuration<true>,
  { expose = false as T }: {expose?: T} = { expose: false as T }
) {

  if(!configuration.sectorAlarm.port) {
    throw new Error("[port] must be defined in tests");
  }

  if(expose) {
    return (async next => {
      const application = new MockedSectorApi(configuration, configuration.mockData);

      const server = new https.Server({
        key: configuration.mockData.ssl.key,
        cert: configuration.mockData.ssl.cert
      }, application.callback());

      await new Promise<void>(resolve => server.listen(configuration.sectorAlarm.port, resolve));

      let error: Error | undefined;

      await next(application).catch((err: Error | undefined) => error = err);

      await new Promise(resolve => server.close(resolve));

      if(error) {
        throw error;
      }
    }) as T extends true ? Middleware<MockedSectorApi> : never;
  }
  else {
    return (async next => {
      const application = new MockedSectorApi(configuration, configuration.mockData);

      const server = new https.Server({
        key: configuration.mockData.ssl.key,
        cert: configuration.mockData.ssl.cert
      }, application.callback());

      await new Promise<void>(resolve => server.listen(configuration.sectorAlarm.port, resolve));

      let error: Error | undefined;

      await next().catch((err: Error | undefined) => error = err);

      await new Promise(resolve => server.close(resolve));

      if(error) {
        throw error;
      }
    }) as T extends true ? never : Middleware<undefined>;
  }
}
