import { default as debug } from "debug";
import type { Configuration } from "../../lib/@types/Configuration";

export {
  compose,
  withMockedSectorApi,
  withApi
} from "./compose-helpers.js";


export const defaults: Configuration<true> = {
  sectorAlarm: {
    host: "https://localhost:8080/",
    port: 8080,
    additionalHeaders: {
      ADRUM: "isAjax:true",
      ADRUM_1: "isMobile:true",
      version: "2.7.4",
      "API-Version": "6",
      Platform:	"iOS",
      "User-Agent":	"Sector%20Alarm/502 CFNetwork/1325.0.1 Darwin/21.1.0"
    },
    endpoints: {
      login: "/api/Login/Login",
      getPanelList: "/api/Account/GetPanelList",
      getPanel: "/api/Panel/GetPanel", // panelId
      getPanelStatus: "/api/Panel/GetPanelStatus", // panelId
      disarm: "/api/Panel/Disarm",
      getTemperatures: "/api/Panel/GetTemperatures", // panelId
      totalArm:	"/api/Panel/Arm",
      partialArm:	"/api/Panel/PartialArm",
      setSettings: "/api/Settings/SetPanelSettings"
    }
  },
  logger: {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    debug: (msg: string, obj?: Record<string, unknown>) => obj ? debug("sectoralarm:debug")("%s %o", msg, obj) : debug("sectoralarm:debug")("%s", msg),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    info: (msg: string, obj?: Record<string, unknown>) => obj ? debug("sectoralarm:info")("%s %o", msg, obj) : debug("sectoralarm:info")("%s", msg),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    warn: (msg: string, obj?: Record<string, unknown>) => obj ? debug("sectoralarm:warn")("%s %o", msg, obj) : debug("sectoralarm:warn")("%s", msg),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    error: (msg: string, obj?: Record<string, unknown>) => obj ? debug("sectoralarm:error")("%s %o", msg, obj) : debug("sectoralarm:error")("%s", msg),
  },
  clock: {
    setInterval,
    setTimeout,
    clearInterval,
    clearTimeout,
    Date,
  },
  mockData: {
    PanelId: "123456789",
    ArmedStatus: "disarmed",
    displayName: "Home alarm",
    quickArm: false,
    userID: "john@example.com",
    password: "super-secret",
    panelCode: "1234",

    ssl: {
      cert: `-----BEGIN CERTIFICATE-----
MIIC5zCCAc+gAwIBAgIQPlF7Yz/b+qRQmRY8fy4J7jANBgkqhkiG9w0BAQsFADAn
MRIwEAYDVQQDEwlsb2NhbGhvc3QxETAPBgNVBAoTCERldiBjZXJ0MCAXDTIxMTIx
OTE0MTIzMloYDzIxMjExMTI1MTQxMjMyWjAnMRIwEAYDVQQDEwlsb2NhbGhvc3Qx
ETAPBgNVBAoTCERldiBjZXJ0MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKC
AQEAtBp60J8xlUvsXJx/KEtBIAUoDnFNtSqPf31jI8VyQ5L/xjNUyYt2PneVHzwp
8nwFO44xSGamNHD3hNjQPoRGphZQnQVHc3hIA7sWAcTZegifoaBBGmA9PJsAulb1
YonIGwZLgH8rVqwl0PLfwD6VJGo3n7dI8ssfvJqTUpahdknyDZSf/EMMgdOZxzj5
Me3mI7vgwp01eMS9Adu/igdIgo86Coikx1RzafWZK66X9eVgZ3BQPABdUuUEdYzM
SC8S5r2P1OXdp3r2Og4n15ku5dG6ncPwR54zG22NXKlbPHocd2syvNuXBUawD8wL
1x/m3MuNe1j6MQJfcHSyTWFOvwIDAQABow0wCzAJBgNVHRMEAjAAMA0GCSqGSIb3
DQEBCwUAA4IBAQBxOy6E6eNK5gianx+D69pGmBgUJI1kuWMwERH00NH2UWrsnVU6
CLbH8XWCBCZ14ln6QxjcVi2OR32bC+PsHr5eZrfDyP+P7+Qm2cfWpoxLL0Lad2JE
r5PDZGQfwfQpOUaejjv25uiN9q5onPLvrHQSXyAtme1KZYdVb6/eX0QVujje8hCI
uGCPRu5A/DS/cLzOEtBM0LelkW7dmfDVx3iqUvL5JXZle0Vic1hUlihCtOTR6swO
+s1AT4ZJa4fuU4sqROBO0vDrdV2upcZo7pLPk1KKSUMjLaDMgDiF7XtO7sxw3GKC
cRnalvy+UApWGWFDBJP2elzEd+h3FDcWdsfA
-----END CERTIFICATE-----`,
      key: `-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAtBp60J8xlUvsXJx/KEtBIAUoDnFNtSqPf31jI8VyQ5L/xjNU
yYt2PneVHzwp8nwFO44xSGamNHD3hNjQPoRGphZQnQVHc3hIA7sWAcTZegifoaBB
GmA9PJsAulb1YonIGwZLgH8rVqwl0PLfwD6VJGo3n7dI8ssfvJqTUpahdknyDZSf
/EMMgdOZxzj5Me3mI7vgwp01eMS9Adu/igdIgo86Coikx1RzafWZK66X9eVgZ3BQ
PABdUuUEdYzMSC8S5r2P1OXdp3r2Og4n15ku5dG6ncPwR54zG22NXKlbPHocd2sy
vNuXBUawD8wL1x/m3MuNe1j6MQJfcHSyTWFOvwIDAQABAoIBAEn6togLXCqfTS+d
eP3sK4wjkhicofbQzLDpqFeBOzZWo4mefC1tg9yU8kQqSnC4UM3t0oCS6aKQ5JtF
FAUaAIsoj2RwTrE3rx0ZNCj12v8tm6SgVx2meoDyipIANjuLrQ6sv0bA9eRcQgxa
N16YVlrm5oJMn0Jb/WVTeUBrb1dOxjd4Ljj1CG/v1CaRoclVs6a/4MVTlUgR6Iml
JUlhObaW+wBCTVnxYNGG+WC7X6CfcczAFZuwVizeCb4eOvKMlx3TEUK3Ib9hTi36
xnxQ57jDhr/WwCWUNYMyZV7RnToXUIym79nXrR3OKMoz5twcEgRKbbUzQ+vN+4eb
9w9ECwECgYEA+LIENP8N5NgWLcgf3KcswXDwPqmE6rvM3YrKCB55/3i+pyawvd9d
5Xqi3D6lLByMpcybllfZvMaRh7kciWWroxNlvOjbOK+CBHgGj1Ef20GGk4n4coDf
eqlGg8dR4AkH9/TxdebH7p2FJ8nOsa1y/pln0hIA6nXPlIR51QSo8U8CgYEAuWS1
adZNGyOc+Vz/n0pl4Rl3WBn3ZtodEaRu69n0Q7b1wqx8GXUFvl5SZ/NOWAfqKmYD
8pvlo7Gj1os3f1vcbm7mejyuBBRR+lyIlJPyBd/7u4xTNppZvI9Ke+p7WeuCeV/K
CEwnODcciLn2fsF/bk7VwL2NYYXtHLpOaO5jD5ECgYEA5s2fZefHZzi77KUsHMXx
nV1JOX5t4sOD759cvIg8RMI0fkBECxL/u3dDKg/hjry4My9evfquEqpeaY18VG9N
CT15UAbzXPpVOfyCagOqAvwe/1Iuh2XfAaGT1bzn2XnIMXDbnsYdivAZocGC2BbX
AD4ywhz/SJkpmvYPc4itmbUCgYBXsxZGXMPY5L3rEF0z4yPSmhNkr9Pi6ab6o4h9
NXthVPlo/+Msv7jZ1xCwb95NsmDJcbzIVYsKJoxUf0LfknryGrAYfv/qmho1jvRl
JJ9GvC//BmCO4fE1S6t2dvOnE8uC0xdlWXDsHNX4r8+1Ip+/dLeVF5X73jjOcCuL
Y8mkoQKBgBxXJ6VjZunjYQnYmvi6d6pEov/StuPkIGD1+T7n1xWw8togoDwNS1Nh
mmQonL/6Er1L4fKhezVfANd8ayfxqDGAmucHOCpBkAVzWoRhNQ8/I0Vzf/58ARqk
A/BIUvMx513BSPCbMLkDtWF8gTynIqJ+sLhyhZETR1COYw6FfOze
-----END RSA PRIVATE KEY-----`
    },

  }
};
