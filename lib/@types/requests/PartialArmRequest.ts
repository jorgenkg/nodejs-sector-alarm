export interface PartialArmRequest {
  PanelId: string;
  Platform: "app";
  /** Empty string if quick-arm is enabled */
  PanelCode: string;
}
