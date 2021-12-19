import type { PanelArmStatus } from "../../misc/PanelArmStatus";

export type GetPanelListResponse = Array<{
  PanelId: string;
  DisplayName: string;
  LegalOwnerName: string;
  AccessGroup: number;
  Status: PanelArmStatus;
  InstallationStatus: number;
  IsDefaultPanel: boolean;
  PanelTime: string;
  Capabilities: string[];
}>;
