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


## API

### Constructor | new SectorApi( email, password )

##### email

Type: `string`

The email address of an existing Sector Alarm account.

##### password

Type: `string`

The password associated with the Sector Alarm account

### Methods

...

## Disclaimer
This library is NOT an official integration from Sector Alarm. This library is neither endorsed nor supported by Sector Alarm. This client implementation is based on reverse engineering the REST calls used by the Sector Alarm web app.

Any utilization, consumption and operation is done at the user's own discretion. This library, its maintainers and Sector Alarm cannot guarantee the alarms integrity if this library or any application of this library are compromised.