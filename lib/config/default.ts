import { default as debug } from "debug";

export interface Configuration<Test extends boolean = false> {
  sectorAlarm: {
    host: string;
    /** Only defined for tests */
    port?: number;
    version: string;
    endpoints: {
      login: string;
      getUserInfo: string;
      getOverview: string;
      getPanel: string;
      armPanel: string;
      getPanelList: string;
      setPanelSettings: string;
    };
  };
  logger: {
    debug: (msg: string, obj?: Record<string, unknown>) => void,
    info: (msg: string, obj?: Record<string, unknown>) => void,
    warn: (msg: string, obj?: Record<string, unknown>) => void,
    error: (msg: string, obj?: Record<string, unknown>) => void,
  };
  clock: {
    setTimeout: typeof setTimeout;
    clearTimeout: typeof clearTimeout;
    setInterval: typeof setInterval;
    clearInterval: typeof clearInterval;
    Date: typeof Date;
  };
  mockData: Test extends false ? undefined : {
    PanelId: string;
    ArmedStatus: "disarmed" | "armed";
    UpdatedTermsRequired: boolean;
    displayName: string;
    quickArm: boolean;
    panelCode: string;
    userID: string;
    password: string;
  };
}


export default {
  sectorAlarm: {
    host: "https://minside.sectoralarm.no/",
    version: "v1_1_97",
    endpoints: {
      login: "/User/Login",
      getPanelList: "/Panel/GetPanelList/",
      getUserInfo: "/User/GetUserInfo/",
      getOverview: "/Panel/GetOverview/",
      getPanel: "/Panel/GetPanel/",
      armPanel: "/Panel/ArmPanel/",
      setPanelSettings: "/Settings/SetPanelSettings/",
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
    setTimeout: global.setTimeout,
    clearTimeout: global.clearTimeout,
    setInterval: global.setInterval,
    clearInterval: global.clearInterval,
    Date: Date
  }
} as Configuration;
