# Sector Alarm API

A NodeJS client library written in TypeScript with Tape tests covering basic functionality. This client implementation is intended for use in Smart Home applications.

## Requirements

`node >= 12.0`

## Installation

```bash
npm i -S nodejs-sector-alarm
```

## Usage

```javascript
import { SectorApi } from "nodejs-sector-alarm";

// Setup the API client
const api = new SectorApi(email, password);
// Fetch a list of panels/alarms associated with the login credentials
const panelId = await api.getPanelList()[0].PanelId;
const panelCode = 1234;
// Disarm the alarm
await api.changeAlarmState(panelId, "Disarm", panelCode);
```

## Debug logging

This library uses `debug`. Enable all logs by:
```bash
DEBUG=sectoralarm:*
```
or limit the logs to a certain log level by specifying {debug, info, warn, error} e.g:
```bash
DEBUG=sectoralarm:warn,sectoralarm:error
```

## API

### Constructor | new SectorApi( email, password )

##### email

Type: `string`

The email address of an existing Sector Alarm account.

##### password

Type: `string`

The password associated with the Sector Alarm account

### Methods

#### changeAlarmState | `changeAlarmState(panelId: string, command: "Disarm" | "Total" | "Partial", panelCode?: string): Promise<void>`
Change the state of the system to arm or disarm the alarm. The alarm can be armed without specifying the panel code if 'Quick Arm' is enabled.

##### panelId
Type: `string`

The Sector API's unique system identifier. This ID can be fetched using `getPanelList()`

##### command
Type: `"Disarm" | "Total" | "Partial"`

##### panelCode?
Type: `string`

Required if disarming, and for arming if Quick Arm isn't enabled.

#### setPanelSettings | `setPanelSettings(panelId: string, displayName: string, quickArm: boolean): Promise<SetPanelResponse>`
Configure the alarm system's displayName and quickArm status.

##### panelId
Type: `string`

The Sector API's unique system identifier. This ID can be fetched using `getPanelList()`

##### displayName
Type: `string`

##### quickArm
Type: `boolean`

Enable/disable the ability to arm the alarm without specifying the alarm system code. Note that disarming still require the code.

#### getPanelList | `getPanelList(): Promise<PanelListResponse>`
Fetch a list of alarm systems associated with the authentication credentials that were used to create the client instance

...

## Disclaimer
This library is NOT an official integration from Sector Alarm. This library is neither endorsed nor supported by Sector Alarm. This implementation is based on reverse engineering REST calls used by the Sector Alarm web app, and may thus intermittently stop working if the underlying Sector API is updated.

Any utilization, consumption and application of this library is done at the user's own discretion. This library, its maintainers and Sector Alarm cannot guarantee the alarm's integrity if this library or any applications of this library are compromised.