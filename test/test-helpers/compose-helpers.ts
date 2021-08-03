import * as bodyParser from "koa-bodyparser";
import * as crypto from "crypto";
import * as http from "http";
import * as Koa from "koa";
import * as Route from "koa-route";
import * as tape from "tape";
import * as util from "util";
import { GetPanelResponse } from "../../lib/@types/GetPanelResponse";
import { Middleware, TestComposer } from "./compose-types.js";
import { PanelListResponse } from "../../lib/@types/PanelListResponse";
import { PanelOverviewResponse } from "../../lib/@types/PanelOverviewResponse";
import { SectorApi } from "../../lib/SectorApi";
import { UserInfoResponse } from "../../lib/@types/UserInfoResponse";
import type { Configuration } from "../../lib/config/default.js";

const TWENTY_MINUTES_MS = 1000 * 60 * 20;


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
    private __RequestVerificationToken = crypto.randomBytes(8).toString("hex");
    private Login__RequestVerificationToken = crypto.randomBytes(8).toString("hex");
    private ASPXAUTH = crypto.randomBytes(960).toString("hex");
    private configuration: Configuration<true>;

    constructor(config: Configuration<true>, {
      PanelId,
      ArmedStatus,
      UpdatedTermsRequired,
      displayName,
      quickArm,
      userID,
      password,
      panelCode,
    }: Configuration<true>["mockData"]) {
      super();
      this.configuration = config;

      this.use(
        Route.get(this.configuration.sectorAlarm.endpoints.login, ctx => {
          ctx.cookies.set("__RequestVerificationToken", this.__RequestVerificationToken, { httpOnly: true });
          ctx.response.type = "html";
          ctx.response.body = `
          <!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />

    <link href="/Content/sass/main.css?v1_1_88" rel="stylesheet" />
    <title>Login</title>
    <!--<script src="~/Scripts/mainLogin.js"></script> -->
    
    <script src="/Scripts/main.js?v1_1_88"></script>


    <script>
        (function (i, s, o, g, r, a, m) {
            i['GoogleAnalyticsObject'] = r; i[r] = i[r] || function ()
            { (i[r].q = i[r].q || []).push(arguments) }
            , i[r].l = 1 * new Date(); a = s.createElement(o),
            m = s.getElementsByTagName(o)[0]; a.async = 1; a.src = g; m.parentNode.insertBefore(a, m)
        })(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');
        ga('create', 'UA-45204970-2', 'auto');
        ga('send', 'pageview');
    </script>

</head>

<body>
    <ng-include src="'../Views/AngularTemplates/Templates/svg-icons.html'"></ng-include>


    <main>
        <div>
            



<div class="background-image" ng-cloak translate-cloak>
    <header class="navbar">
        <div class="navbar__container">
            <div class="navbar__logo">
                <a href="#!/"><div ng-include src="'../Views/AngularTemplates/Templates/_logo.html'"></div></a>
                            </div>
        </div>
    </header>

    <div class="background-image__login">

        <div ng-if="system.loading" class="header">
            <h1 class="center">{{ "Loading" | translate }}...</h1>
        </div>
        <div ng-if="!system.loading">

            <h1 translate="Welcome to a more secure home"> </h1>


            <br />


<form action="/User/Login" id="frmLogin" method="post" name="frmLogin" role="form"><input name="__RequestVerificationToken" type="hidden" value="${this.Login__RequestVerificationToken}" />                <div ng-show="signIn">

                    <label class="form">
                        {{ "E-mail" | translate }}
                        <input name="userID"
                               type="email"
                               ng-model="userID"
                               placeholder="{{'E-mail' | translate}}"
                               class="form__input"
                               validation="email"
                               focus-if="signIn" />
                        <error-messages field="frmLogin.userID" form="frmLogin" />
                    </label>
                    <label class="form">
                        {{ "Password" | translate }}
                        <input type="password" placeholder="{{'Password' | translate}}" class="form__input" name="password" ng-model="password" required />

                        <span ng-if="btnDisFP" class="right loader"></span>
                        <a ng-click="btnDisFP=true;" ng-disabled="btnDisFP" href="/user/ForgotPassword" class="right form__help">{{ "Forgot password" | translate }}</a>

                    </label>
                    <div>
                        <span class="white"></span>
                    </div>
                    <button ng-click="btnDisLI=true;" ng-disabled="!frmLogin.$valid" type="submit" class="button button--third" ng-class="{'button--disabled':btnDisLI}">{{ "Sign in" | translate }}</button>

                    <span ng-if="btnDisLI" class="loader"></span>
                    <a href="" class="form__help" ng-click="signIn = false">{{ "Cancel" | translate }}</a>
                </div>
</form>            <div ng-show="!signIn">
                <button ng-click="$parent.signIn = true" href="#!/app" class="button button--third" translate="Sign in"></button>



            </div>

        </div>

        <br />
        <h2 translate="Already a customer, but haven't registered your account?"></h2>
        <p>
            <span translate="Start using My pages and our apps today to get full control over your alarm system."></span> <br />
            <a ng-click="btnDis=true;" ng-disabled="btnDis" href="/user/registration" class="button button--primary button--small" translate="Create your account"></a>
            <span ng-if="btnDis" class="loader"></span>
        </p>
        
        <div ng-controller="mobileDeviceController">
            <div ng-if="device.isMobile()">                
                <span ng-if="device.device=='android'">
                    <span ng-if="currentLanguage=='nb'">
                        <a href='https://play.google.com/store/apps/details?id=com.sector.sectoralarm&pcampaignid=MKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1'><img class="app-download" alt='Tilgjengelig på Google Play' src='https://play.google.com/intl/en_us/badges/images/generic/no_badge_web_generic.png' /></a>
                    </span>
                    <span ng-if="currentLanguage=='sv'">
                        <a href='https://play.google.com/store/apps/details?id=com.sector.sectoralarm&pcampaignid=MKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1'><img class="app-download" alt='Ladda ned på Google Play' src='https://play.google.com/intl/en_us/badges/images/generic/sv_badge_web_generic.png' /></a>
                    </span>
                </span>
                <span ng-if="device.device=='iphone'">
                    <span ng-if="currentLanguage=='nb'">
                        <a href='https://itunes.apple.com/no/app/sector-alarm/id632634458?mt=8'><img class="" alt='Tilgjengelig på App Store' src='/Content/assets/icons/svg/badges/Download_on_the_App_Store_Badge_NO_135x40.svg' /></a>
                    </span>
                    <span ng-if="currentLanguage=='sv'">
                        <a href='https://itunes.apple.com/no/app/sector-alarm/id632634458?mt=8'><img class="" alt='Ladda ned på App Store' src='/Content/assets/icons/svg/badges/Download_on_the_App_Store_Badge_SE_135x40.svg' /></a>
                    </span>
                </span>
            </div>
        </div>
    </div>
</div>




        </div>
    </main>

    <footer class="footer">
        2020 © Sector Alarm | <a target="_blank" href="/User/Terms/">{{ "User terms and cookies" | translate }}</a>
    </footer>
    <!-- Start of LiveChat (www.livechatinc.com) code -->
    <script type="text/javascript">
        window.__lc = window._lc || {};
        window.__lc.license = 6849871;
        (function () {
            var lc = document.createElement('script'); lc.type = 'text/javascript'; lc.async = true; lc.src = ('https:' == document.location.protocol ? 'https://' : 'http://') + 'cdn.livechatinc.com/tracking.js'; var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(lc, s); }
        )();
    </script>
    <!-- End of LiveChat code -->
</body>
</html>`;
        })
      );

      this.use(Route.all("*", async(ctx, path, next: Koa.Next) => {
        if(ctx.cookies.get("__RequestVerificationToken") !== this.__RequestVerificationToken) {
          ctx.response.status = 401;
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          ctx.response.body = { message: `The request cookies did not contain a valid __RequestVerificationToken. Was '${ctx.cookies.get("__RequestVerificationToken")}', should be '${this.__RequestVerificationToken}'` };
          return;
        }
        await next();
      }));

      this.use(bodyParser());

      this.use(
        Route.post(this.configuration.sectorAlarm.endpoints.login, ctx => {
          const body = ctx.request.body as {
            __RequestVerificationToken: string;
            userID: string;
            password: string;
          };

          if(ctx.request.headers["content-type"] !== "application/x-www-form-urlencoded") {
            ctx.response.status = 400;
            ctx.response.body = { message: "The request sent data using the wrong content type" };
            return;
          }
          else if(body.__RequestVerificationToken !== this.Login__RequestVerificationToken) {
            ctx.response.status = 400;
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            ctx.response.body = { message: `The request did not present a valid __RequestVerificationToken for login. Should be '${this.Login__RequestVerificationToken}', was: '${body.__RequestVerificationToken}'` };
            return;
          }
          else if(body.userID !== userID) {
            // The Sector API will return 200 OK with an error message, and without setting the ASPX cookie
            ctx.response.status = 200;
            ctx.response.body = { message: "The request did not present a valid userID/email" };
            this.configuration.logger.warn("The request did not specify a valid userID/email");
            return;
          }
          else if(body.password !== password) {
            // The Sector API will return 200 OK with an error message, and without setting the ASPX cookie
            ctx.response.status = 200;
            ctx.response.body = { message: "The request did not present a valid password" };
            this.configuration.logger.warn("The request did not specify a valid password");
            return;
          }
          else {
            // Set the authentication cookie
            ctx.cookies.set(".ASPXAUTH", this.ASPXAUTH, {
              expires: new Date(this.configuration.clock.Date.now() + TWENTY_MINUTES_MS),
              httpOnly: true
            });

            ctx.response.status = 200;
          }
        })
      );

      // Verify the presence of an authentication cookie
      this.use(Route.all("*", async(ctx, path, next: Koa.Next) => {
        if(ctx.cookies.get(".ASPXAUTH") !== this.ASPXAUTH) {
          ctx.response.status = 401;
          ctx.response.body = "Wrong or missing authentication cookie";
          return;
        }
        await next();
      }));

      this.use(
        Route.get(this.configuration.sectorAlarm.endpoints.getPanelList, ctx => {
          ctx.response.body = [{
            "PanelId": PanelId,
            "ArmedStatus": ArmedStatus,
            "PanelDisplayName": displayName,
            "StatusAnnex": "unknown",
            "PanelTime": `/Date(${this.configuration.clock.Date.now()})/`,
            "AnnexAvalible": false,
            "IVDisplayStatus": false,
            "DisplayWizard": false,
            "BookedStartDate": `/Date(-${this.configuration.clock.Date.now()})/`,
            "BookedEndDate": `/Date(-${this.configuration.clock.Date.now()})/`,
            "InstallationStatus": 3,
            "InstallationAddress": null,
            "WizardStep": 0,
            "AccessGroup": 1,
            "SessionExpires": `/Date(${this.configuration.clock.Date.now() + 1000 * 60 * 24})/`,
            "IsOnline": false
          }] as PanelListResponse;
        })
      );

      this.use(
        Route.get(this.configuration.sectorAlarm.endpoints.getUserInfo, ctx => {
          ctx.body = {
            "userNation": 2,
            "Roles": [
              "User"
            ],
            "language": "nb",
            "culture": "nb-NO",
            "impersonation": false,
            "NationHasCRM": true,
            "NationUseIrCam": true,
            "NationCanAddSmartPlug": false,
            "CustomerNo": "12345678",
            "CSNumber": "000 12345",
            "UpdatedTermsRequired": UpdatedTermsRequired,
            "unreadMessages": 0,
            "TotalMessages": 0
          } as UserInfoResponse;
        })
      );

      this.use(
        Route.post(this.configuration.sectorAlarm.endpoints.getOverview, ctx => {
          const body = ctx.request.body as {
            PanelId: string;
            Version: string;
          };

          if(body.PanelId !== PanelId) {
            ctx.response.status = 400;
            ctx.response.body = { message: "The request did not present a valid PanelId" };
            return;
          }
          else if(body.Version !== this.configuration.sectorAlarm.version) {
            ctx.response.status = 400;
            ctx.response.body = { message: "The request did not present a valid version number" };
            return;
          }

          ctx.body = {
            "Panel": {
              "PartialAvalible": true,
              "PanelQuickArm": quickArm,
              "PanelCodeLength": 4,
              "LockLanguage": 1,
              "SupportsApp": true,
              "SupportsInterviewServices": true,
              "SupportsPanelUsers": true,
              "SupportsTemporaryPanelUsers": true,
              "SupportsRegisterDevices": true,
              "CanAddDoorLock": false,
              "CanAddSmartPlug": false,
              "HasVideo": false,
              "Wifi": {
                "WifiExist": false,
                "Serial": ""
              },
              "PanelId": PanelId,
              "ArmedStatus": ArmedStatus,
              "PanelDisplayName": displayName,
              "StatusAnnex": "unknown",
              "PanelTime": `/Date(${this.configuration.clock.Date.now()})/`,
              "AnnexAvalible": false,
              "IVDisplayStatus": false,
              "DisplayWizard": false,
              "BookedStartDate": `/Date(${this.configuration.clock.Date.now()})/`,
              "BookedEndDate": `/Date(${this.configuration.clock.Date.now()})/`,
              "InstallationStatus": 3,
              "InstallationAddress": null,
              "WizardStep": 0,
              "AccessGroup": 0,
              "SessionExpires": `/Date(${this.configuration.clock.Date.now()})/`,
              "IsOnline": false
            },
            "Locks": [],
            "Smartplugs": [],
            "Temperatures": [
              {
                "Id": null,
                "Label": "Foo sensor name",
                "SerialNo": "123456E1234",
                "Temprature": "",
                "DeviceId": null
              }
            ],
            "Cameras": [],
            "Photos": [],
            "Access": [
              "History",
              "Directions",
              "SecurityQuestion",
              "ContactPersons",
              "AlarmSystemSettings",
              "LockSettings",
              "SmartplugSettings",
              "Photos",
              "Smartplugs",
              "Cameras",
              "CameraSettings",
              "PanelUsers",
              "AddProducts",
              "AppUserSettings",
              "PreInstallationSettings"
            ]
          } as PanelOverviewResponse;
        })
      );

      this.use(
        Route.post(this.configuration.sectorAlarm.endpoints.getPanel, ctx => {
          const body = ctx.request.body as GetPanelResponse;

          if(body.PanelId !== PanelId) {
            ctx.response.status = 400;
            ctx.response.body = { message: "The request did not present a valid PanelId" };
            return;
          }

          ctx.body = {
            "PanelCodeLength": 4,
            "LockLanguage": 1,
            "HasAnnex": false,
            "DisplayWizard": false,
            "CanAddDoorLock": false,
            "CanAddSmartplug": false,
            "CanPartialArm": true,
            "QuickArmEnabled": quickArm,
            "SupportsPanelUsers": true,
            "SupportsTemporaryPanelUsers": true,
            "SupportsRegisterDevices": true,
            "InterviewDisplayStatus": false,
            "PreInstallationWizardDone": false,
            "CanChangeInstallationDate": false,
            "WizardStep": 0,
            "PanelId": PanelId,
            "DisplayName": "Display name foo",
            "InstallationAddress": null,
            "InstallationStatus": 3,
            "BookedStartDate": `/Date(${this.configuration.clock.Date.now()})/`,
            "BookedEndDate": `/Date(${this.configuration.clock.Date.now()})/`,
            "PropertyContact": {
              "AppUserId": "123456",
              "FirstName": "John",
              "LastName": "Doe",
              "PhoneNumber": "12345678",
              "AccessGroup": 1,
              "IsPropertyContact": true,
              "IsInvite": false,
              "AddSmartPlugUserOverride": false
            },
            "Wifi": null,
            "HasVideo": false,
            "Video": 0,
            "Access": [
              "History",
              "Directions",
              "SecurityQuestion",
              "ContactPersons",
              "AlarmSystemSettings",
              "LockSettings",
              "SmartplugSettings",
              "Photos",
              "Smartplugs",
              "Cameras",
              "CameraSettings",
              "PanelUsers",
              "AddProducts",
              "AppUserSettings",
              "PreInstallationSettings"
            ],
            "Locks": [],
            "Smartplugs": [],
            "Temperatures": [
              {
                "Id": null,
                "Label": "Foo sensor name",
                "SerialNo": "123456E1234",
                "Temprature": "",
                "DeviceId": null
              }
            ],
            "Photos": []
          } as GetPanelResponse;
        })
      );

      this.use(
        Route.post(this.configuration.sectorAlarm.endpoints.armPanel, ctx => {
          const body = ctx.request.body as {
            ArmCmd: "Disarm"|"Total"|"Partial",
            HasLocks: false,
            id: string,
            PanelCode: string,
          };

          if(!("ArmCmd" in body)) {
            ctx.response.status = 400;
            ctx.response.body = { message: `The request did not specify ArmCmd: ${JSON.stringify(body)}` };
            return;
          }
          else if(!("HasLocks" in body)) {
            ctx.response.status = 400;
            ctx.response.body = { message: `The request did not specify HasLocks: ${JSON.stringify(body)}` };
            return;
          }
          else if(body.PanelCode === "" && quickArm !== true) {
            ctx.response.status = 400;
            ctx.response.body = { message: `The request must specify a PanelCode when quick arm isn't enabled: ${JSON.stringify(body)}` };
            return;
          }
          else if(body.PanelCode !== "" && body.PanelCode !== panelCode) {
            ctx.response.status = 400;
            ctx.response.body = { message: `The request did not specify the correct PanelCode ${panelCode}: ${JSON.stringify(body)}` };
            return;
          }
          else if(body.id !== PanelId) {
            ctx.response.status = 400;
            ctx.response.body = { message: `The request specified an incorrect panelID: ${JSON.stringify(body)}` };
            return;
          }

          if(body.ArmCmd === "Partial") {
            ctx.body = {
              "status": "success",
              "message": null,
              "time": null,
              "user": null,
              "panelData": {
                "PanelId": PanelId,
                "ArmedStatus": "partialarmed",
                "PanelDisplayName": displayName,
                "StatusAnnex": "unknown",
                "PanelTime": `/Date(${this.configuration.clock.Date.now()})/`,
                "AnnexAvalible": false,
                "IVDisplayStatus": false,
                "DisplayWizard": false,
                "BookedStartDate": `/Date(${this.configuration.clock.Date.now()})/`,
                "BookedEndDate": `/Date(${this.configuration.clock.Date.now()})/`,
                "InstallationStatus": 3,
                "InstallationAddress": null,
                "WizardStep": 0,
                "AccessGroup": 1,
                "SessionExpires": `/Date(${this.configuration.clock.Date.now()})/`,
                "IsOnline": true
              },
              "ReloadLocks": false
            };
          }
          else if(body.ArmCmd === "Total") {
            ctx.body = {
              "status": "success",
              "message": null,
              "time": null,
              "user": null,
              "panelData": {
                "PanelId": PanelId,
                "ArmedStatus": "armed",
                "PanelDisplayName": displayName,
                "StatusAnnex": "unknown",
                "PanelTime": `/Date(${this.configuration.clock.Date.now()})/`,
                "AnnexAvalible": false,
                "IVDisplayStatus": false,
                "DisplayWizard": false,
                "BookedStartDate": `/Date(${this.configuration.clock.Date.now()})/`,
                "BookedEndDate": `/Date(${this.configuration.clock.Date.now()})/`,
                "InstallationStatus": 3,
                "InstallationAddress": null,
                "WizardStep": 0,
                "AccessGroup": 1,
                "SessionExpires": `/Date(${this.configuration.clock.Date.now()})/`,
                "IsOnline": true
              },
              "ReloadLocks": false
            };
          }
          else if(body.ArmCmd === "Disarm") {
            ctx.body = {
              "status": "success",
              "message": null,
              "time": null,
              "user": null,
              "panelData": {
                "PanelId": PanelId,
                "ArmedStatus": "disarmed",
                "PanelDisplayName": displayName,
                "StatusAnnex": "unknown",
                "PanelTime": `/Date(${this.configuration.clock.Date.now()})/`,
                "AnnexAvalible": false,
                "IVDisplayStatus": false,
                "DisplayWizard": false,
                "BookedStartDate": `/Date(${this.configuration.clock.Date.now()})/`,
                "BookedEndDate": `/Date(${this.configuration.clock.Date.now()})/`,
                "InstallationStatus": 3,
                "InstallationAddress": null,
                "WizardStep": 0,
                "AccessGroup": 1,
                "SessionExpires": `/Date(${this.configuration.clock.Date.now()})/`,
                "IsOnline": true
              },
              "ReloadLocks": false
            };
          }
          else {
            throw new Error("Unrecognized ArmCmd");
          }
        })
      );

      this.use(
        Route.post(this.configuration.sectorAlarm.endpoints.setPanelSettings, ctx => {
          const body = ctx.request.body as {
            displayName?: string,
            panelId?: string,
            quickArm?: boolean,
            systemPassword?: string
          };

          if(body.panelId !== PanelId) {
            ctx.response.status = 400;
            ctx.response.body = { message: `The request did not present a valid PanelId: ${JSON.stringify(body)}` };
            return;
          }
          else if(body.systemPassword !== password) {
            ctx.response.status = 403;
            ctx.response.body = { message: `The request did not present a valid systemPassword: ${JSON.stringify(body)}` };
            return;
          }
          else if(!body.displayName === undefined) {
            ctx.response.status = 400;
            ctx.response.body = { message: `The request did not provide a value for [displayName]: ${JSON.stringify(body)}` };
            return;
          }
          else if(body.quickArm === undefined) {
            ctx.response.status = 400;
            ctx.response.body = { message: `The request did not provide a value for [quickArm]: ${JSON.stringify(body)}` };
            return;
          }

          ctx.body = JSON.stringify("success");
        })
      );
    }

    public invalidateCookie() {
      this.__RequestVerificationToken = crypto.randomBytes(8).toString("hex");
      this.Login__RequestVerificationToken = crypto.randomBytes(8).toString("hex");
      this.ASPXAUTH = crypto.randomBytes(960).toString("hex");
    }
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function withMockedSectorApi<T extends boolean = false>(
  configuration: Configuration<true>,
  { expose = false as T }: {expose?: T} = { expose: false as T }
) {

  if(expose) {
    return (async next => {
      const application = new MockedSectorApi(configuration, configuration.mockData);

      const server = new http.Server(application.callback());

      if(!configuration.sectorAlarm.port) {
        throw new Error("[port] must be definde in tests");
      }

      await new Promise<void>(resolve => server.listen(configuration.sectorAlarm.port, resolve));

      try {
        await next(application);
      }
      catch(error) {
        configuration.logger.error(util.inspect(error, false, null));
      }
      finally {
        await new Promise(resolve => server.close(resolve));
      }
    }) as T extends true ? Middleware<MockedSectorApi> : never;
  }
  else {
    return (async next => {
      const application = new MockedSectorApi(configuration, configuration.mockData);

      const server = new http.Server(application.callback());

      if(!configuration.sectorAlarm.port) {
        throw new Error("[port] must be definde in tests");
      }

      await new Promise<void>(resolve => server.listen(configuration.sectorAlarm.port, resolve));

      try {
        await next();
      }
      catch(error) {
        configuration.logger.error(util.inspect(error, false, null));
      }
      finally {
        await new Promise(resolve => server.close(resolve));
      }
    }) as T extends true ? never : Middleware<undefined>;
  }
}
