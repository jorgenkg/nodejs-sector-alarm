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
