import { default as debug } from "debug";
import type { Configuration } from "../../lib/config/default.js";

export {
  compose,
  withMockedSectorApi,
  withApi
} from "./compose-helpers.js";


export const defaults: Configuration<true> = {
  sectorAlarm: {
    host: "http://localhost:8080/",
    port: 8080,
    version: "v1_2_00",
    endpoints: {
      login: "/User/Login",
      getPanelList: "/Panel/GetPanelList/",
      getUserInfo: "/User/GetUserInfo/",
      getOverview: "/Panel/GetOverview/",
      getPanel: "/Panel/GetPanel/",
      armPanel: "/Panel/ArmPanel/",
      setPanelSettings: "/Settings/SetPanelSettings/"
    }
  },
  logger: {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    debug: (msg: string, obj?: Record<string, unknown>) => obj ? debug("sectoralarm:debug")("%s %o", msg, obj) : debug("sectoralarm:debug")("%s", msg),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    info: (msg: string, obj?: Record<string, unknown>) => obj ? debug("sectoralarm:info")("%s %o", msg, obj) : debug("sectoralarm:info")("%s", msg),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    warn: (msg: string, obj?: Record<string, unknown>) => obj ? debug("sectoralarm:warn")("%s %o", msg, obj) : debug("sectoralarm:warn")("%s", msg),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    error: (msg: string, obj?: Record<string, unknown>) => obj ? debug("sectoralarm:error")("%s %o", msg, obj) : debug("sectoralarm:error")("%s", msg),
  },
  clock: {
    setInterval,
    setTimeout,
    clearInterval,
    clearTimeout,
    Date,
  },
  mockData: {
    PanelId: "123456789",
    ArmedStatus: "disarmed",
    UpdatedTermsRequired: false,
    displayName: "Home alarm",
    quickArm: false,
    userID: "john@example.com",
    password: "super-secret",
    panelCode: "1234",
  }
};
