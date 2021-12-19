import { default as debug } from "debug";

export interface Configuration<Test extends boolean = false> {
  sectorAlarm: {
    host: string;
    /** Only defined for tests */
    port?: number;
    additionalHeaders: {
      ADRUM: "isAjax:true",
      ADRUM_1: "isMobile:true",
      version: string,
      "API-Version":string,
      Platform:	"iOS",
      "User-Agent":	"Sector%20Alarm/502 CFNetwork/1325.0.1 Darwin/21.1.0"
    },
    endpoints: {
      login: string;
      getPanelList: string;
      getPanel: string;
      getPanelStatus: string;
      disarm: string;
      getTemperatures: string;
      totalArm: string;
      partialArm: string;
      setSettings: string;
    }
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
    displayName: string;
    quickArm: boolean;
    panelCode: string;
    userID: string;
    password: string;
    ssl: {
      key: string;
      cert: string;
    }
  };
}


export default {
  sectorAlarm: {
    host: "https://mypagesapi.sectoralarm.net/",
    additionalHeaders: {
      ADRUM: "isAjax:true",
      ADRUM_1: "isMobile:true",
      version: "2.7.4",
      "API-Version": "6",
      Platform:	"iOS",
      "User-Agent":	"Sector%20Alarm/502 CFNetwork/1325.0.1 Darwin/21.1.0"
    },
    endpoints: {
      login: "/api/Login/Login",
      getPanelList: "/api/Account/GetPanelList",
      getPanel: "/api/Panel/GetPanel", // panelId
      getPanelStatus: "/api/Panel/GetPanelStatus", // panelId
      disarm: "/api/Panel/Disarm",
      getTemperatures: "/api/Panel/GetTemperatures", // panelId
      totalArm:	"/api/Panel/Arm",
      partialArm:	"/api/Panel/PartialArm",
      setSettings: "/api/Settings/SetPanelSettings"
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
