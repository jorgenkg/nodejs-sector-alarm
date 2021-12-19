
export interface Configuration<Test extends boolean = false> {
  sectorAlarm: {
    host: string;
    /** Only defined for tests */
    port?: number;
    additionalHeaders: {
      ADRUM: "isAjax:true";
      ADRUM_1: "isMobile:true";
      version: string;
      "API-Version": string;
      Platform: "iOS";
      "User-Agent": "Sector%20Alarm/502 CFNetwork/1325.0.1 Darwin/21.1.0";
    };
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
    };
  };
  logger: {
    debug: (msg: string, obj?: Record<string, unknown>) => void;
    info: (msg: string, obj?: Record<string, unknown>) => void;
    warn: (msg: string, obj?: Record<string, unknown>) => void;
    error: (msg: string, obj?: Record<string, unknown>) => void;
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
    };
  };
}
