export interface LoginResponse {
  AuthorizationToken: string;
  User: {
    UserId: number;
    UserName: string;
    FirstName: string;
    LastName: string;
    NationId: number;
    Nationality: number;
    Roles: any[];
    UserCultureInfo: string;
    CustomerNo: string;
    CellPhone: string;
    Brand: number;
    IsEnterpriseCustomer: boolean;
    NationHasCRM: boolean;
    NationUseIRCam: boolean;
    NationCanAddSmartPlug: boolean;
    UpdatedTermsRequired: boolean;
    Features: string[];
    UnreadMessages: number;
    Impersonation: boolean;
    ImpersonatingUserName: null;
    ImpersonatingUserId: number;
  };
  Resources: {
    CustomerServicePhone: string;
    TermsUrl: string;
  };
  DefaultPanelId: null;
}
