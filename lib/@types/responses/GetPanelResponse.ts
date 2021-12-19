export interface GetPanelResponse {
  PanelCodeLength: number;
  LockLanguage: number;
  HasAnnex: boolean;
  DisplayWizard: boolean;
  CanAddDoorLock: boolean;
  CanAddSmartplug: boolean;
  CanPartialArm: boolean;
  QuickArmEnabled: boolean;
  SupportsPanelUsers: boolean;
  SupportsTemporaryPanelUsers: boolean;
  SupportsRegisterDevices: boolean;
  InterviewDisplayStatus: boolean;
  PreInstallationWizardDone: boolean;
  CanChangeInstallationDate: boolean;
  ArcVideoConsent: null;
  WizardStep: number;
  PanelId: string;
  DisplayName: string;
  InstallationAddress: null;
  InstallationStatus: number;
  BookedStartDate: string;
  BookedEndDate: string;
  PropertyContact: {
    AppUserId: string;
    FirstName: string;
    LastName: string;
    PhoneNumber: string;
    AccessGroup: number;
    IsPropertyContact: boolean;
    IsInvite: boolean;
    AddSmartPlugUserOverride: boolean;
  };
  Wifi: null;
  HasVideo: boolean;
  Video: number;
  Access: string[];
  Capabilities: string[];
  Locks: any[];
  Smartplugs: any[];
  Temperatures: Array<{
    Id: null;
    Label: string;
    SerialNo: string;
    Temprature: string;
    DeviceId: null;
  }>;
  Photos: any[];
}


