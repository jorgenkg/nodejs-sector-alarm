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
