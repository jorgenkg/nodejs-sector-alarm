export type PanelListResponse = {
  "PanelId": string;
  "ArmedStatus": "armed" | "disarmed";
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
  "AccessGroup": 1;
  /** /Date(<epoch>)/ */
  "SessionExpires": string;
  "IsOnline": false;
}[];

export type UserInfoResponse = {
  "userNation": 2;
  "Roles": ["User"];
  "language": "nb";
  "culture": "nb-NO";
  "impersonation": false;
  "NationHasCRM": true;
  "NationUseIrCam": true;
  "NationCanAddSmartPlug": false;
  "CustomerNo": string;
  "CSNumber": string;
  "UpdatedTermsRequired": boolean;
  "unreadMessages": 0;
  "TotalMessages": 0;
};
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
    "ArmedStatus": "armed" | "disarmed";
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
export type GetPanelResponse = {
  "PanelCodeLength": 4;
  "LockLanguage": 1;
  "HasAnnex": false;
  "DisplayWizard": false;
  "CanAddDoorLock": false;
  "CanAddSmartplug": false;
  "CanPartialArm": true;
  "QuickArmEnabled": boolean;
  "SupportsPanelUsers": true;
  "SupportsTemporaryPanelUsers": true;
  "SupportsRegisterDevices": true;
  "InterviewDisplayStatus": false;
  "PreInstallationWizardDone": false;
  "CanChangeInstallationDate": false;
  "WizardStep": 0;
  "PanelId": string;
  "DisplayName": "Display name foo";
  "InstallationAddress": null;
  "InstallationStatus": 3;
  /** /Date(<epoch>)/ */
  "BookedStartDate": string;
  /** /Date(<epoch>)/ */
  "BookedEndDate": string;
  "PropertyContact": {
    "AppUserId": string;
    "FirstName": string;
    "LastName": string;
    "PhoneNumber": string;
    "AccessGroup": 1;
    "IsPropertyContact": true;
    "IsInvite": false;
    "AddSmartPlugUserOverride": false;
  };
  "Wifi": null;
  "HasVideo": false;
  "Video": 0;
  "Access": ["History", "Directions", "SecurityQuestion", "ContactPersons", "AlarmSystemSettings", "LockSettings", "SmartplugSettings", "Photos", "Smartplugs", "Cameras", "CameraSettings", "PanelUsers", "AddProducts", "AppUserSettings", "PreInstallationSettings"];
  "Locks": [];
  "Smartplugs": [];
  "Temperatures": {
    "Id": null;
    "Label": string;
    "SerialNo": string;
    "Temprature": "";
    "DeviceId": null;
  }[];
  "Photos": [];
};
export type ArmPanelResponse = {

};
export type SetPanelResponse = string | {
  "status":"success",
  "message":null,
  "time":null,
  "user":null,
  "panelData": {
    "PanelId":string,
    "ArmedStatus":"partialarmed"|"disarmed"|"armed",
    "PanelDisplayName": string,
    "StatusAnnex":"unknown",
    "PanelTime":string,
    "AnnexAvalible":boolean,
    "IVDisplayStatus":boolean,
    "DisplayWizard":boolean,
    "BookedStartDate":string,
    "BookedEndDate":string,
    "InstallationStatus":3,
    "InstallationAddress":null,
    "WizardStep":0,
    "AccessGroup":1,
    "SessionExpires":string,
    "IsOnline":boolean
  },
  "ReloadLocks":false
};
