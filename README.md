# Sector Alarm API

A Sector Alarm SDK written in TypeScript with test coverage using Tape. This is intended for use in Smart Home applications.

## Requirements

`node >= 10.0`

## Installation

```bash
npm i -S nodejs-sector-alarm
```

## API

##### [Documentation is available here](https://jorgenkg.github.io/nodejs-sector-alarm/)

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

## Disclaimer
This library is NOT an official integration from Sector Alarm. This library is neither endorsed nor supported by Sector Alarm. This implementation is based on reverse engineering REST calls used by the Sector Alarm iOS app, and may thus intermittently stop working if the underlying Sector API is updated.

Any utilization, consumption and application of this library is done at the user's own discretion. This library, its maintainers and Sector Alarm cannot guarantee the alarm's integrity if this library or any applications of this library are compromised.