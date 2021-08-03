export type SetPanelResponse = {
  "status": "success";
  "message": null;
  "time": null;
  "user": null;
  "panelData": {
    "PanelId": string;
    "ArmedStatus": "partialarmed" | "disarmed" | "armed";
    "PanelDisplayName": string;
    "StatusAnnex": "unknown";
    "PanelTime": string;
    "AnnexAvalible": boolean;
    "IVDisplayStatus": boolean;
    "DisplayWizard": boolean;
    "BookedStartDate": string;
    "BookedEndDate": string;
    "InstallationStatus": 3;
    "InstallationAddress": null;
    "WizardStep": 0;
    "AccessGroup": 1;
    "SessionExpires": string;
    "IsOnline": boolean;
  };
  "ReloadLocks": false;
} | {
  "status": "Something went wrong.";
  "message": null;
  "time": null;
  "user": null;
  "panelData": null;
  "ReloadLocks": false;
};
