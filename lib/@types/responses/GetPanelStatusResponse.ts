import type { PanelArmStatus } from "../../misc/PanelArmStatus";

export interface GetPanelStatusResponse {
  IsOnline: boolean;
  StatusTime: string;
  Status: PanelArmStatus;
  AnnexStatus: number;
}


