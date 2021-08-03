export type PanelOverviewResponse = {
  "Panel": {
    "PartialAvalible": boolean;
    "PanelQuickArm": boolean;
    "PanelCodeLength": 4;
    "LockLanguage": 1;
    "SupportsApp": true;
    "SupportsInterviewServices": true;
    "SupportsPanelUsers": true;
    "SupportsTemporaryPanelUsers": true;
    "SupportsRegisterDevices": true;
    "CanAddDoorLock": false;
    "CanAddSmartPlug": false;
    "HasVideo": false;
    "Wifi": {
      "WifiExist": false;
      "Serial": "";
    };
    "PanelId": string;
    "ArmedStatus": "armed" | "disarmed" | "partialarmed";
    "PanelDisplayName": string;
    "StatusAnnex": "unknown";
    /** /Date(<epoch>)/ */
    "PanelTime": string;
    "AnnexAvalible": false;
    "IVDisplayStatus": false;
    "DisplayWizard": false;
    /** /Date(<epoch>)/ */
    "BookedStartDate": string;
    /** /Date(<epoch>)/ */
    "BookedEndDate": string;
    "InstallationStatus": 3;
    "InstallationAddress": null;
    "WizardStep": 0;
    "AccessGroup": 0;
    /** /Date(<epoch>)/ */
    "SessionExpires": string;
    "IsOnline": false;
  };
  "Locks": [];
  "Smartplugs": [];
  "Temperatures": {
    "Id": null;
    "Label": string;
    "SerialNo": string;
    "Temprature": "";
    "DeviceId": null;
  }[];
  "Cameras": [];
  "Photos": [];
  "Access": ["History", "Directions", "SecurityQuestion", "ContactPersons", "AlarmSystemSettings", "LockSettings", "SmartplugSettings", "Photos", "Smartplugs", "Cameras", "CameraSettings", "PanelUsers", "AddProducts", "AppUserSettings", "PreInstallationSettings"];
};
