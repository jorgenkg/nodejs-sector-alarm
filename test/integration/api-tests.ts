import {
  compose,
  defaults,
  withApi,
  withMockedSectorApi
} from "../test-helpers/index.js";
import FakeTimer from "@sinonjs/fake-timers";
import test from "tape";
import type { Middleware } from "../test-helpers/compose-types.js";

const clock = FakeTimer.createClock(0, Infinity);

test("It should support authentication with the user credentials", compose(
  withMockedSectorApi(defaults),
  withApi(defaults),
  async(api, t) => {
    t.ok(await api.login() === undefined, "Expected to successfully sign in");
  }
));

test("When the credentials have expired, it should re-authenticate before sending the request", compose(
  (async next => {
    clock.reset();
    clock.setSystemTime(Date.now());
    await next();
  }) as Middleware<undefined>,
  withMockedSectorApi({ ...defaults, clock: clock as unknown as typeof defaults.clock }),
  withApi({ ...defaults, clock: clock as unknown as typeof defaults.clock }),
  async(api, t) => {
    await api.login();
    await clock.tickAsync("24:00:00");
    const userInfo = await api.getPanelList();
    t.ok(userInfo, "Expected to receive user info");
  }
));

test("If the credentials have been revoked, it should re-authenticate before sending the request", compose(
  withMockedSectorApi({ ...defaults, clock: clock as unknown as typeof defaults.clock }, { expose: true }),
  withApi({ ...defaults, clock: clock as unknown as typeof defaults.clock }),
  async(sector, api, t) => {
    await api.login();
    sector.invalidateToken();
    const userInfo = await api.getPanelList();
    t.ok(userInfo, "Expected to receive user info");
  }
));

test("It should support fetching a list of alarm panels", compose(
  withMockedSectorApi(defaults),
  withApi(defaults),
  async(api, t) => {
    const panelList = await api.getPanelList();
    t.equals(panelList[0].PanelId, defaults.mockData.PanelId, "Expected to receive a list of panels with PanelId-s");
  }
));


test("It should support fetching panel status", compose(
  withMockedSectorApi(defaults),
  withApi(defaults),
  async(api, t) => {
    const panelStatus = await api.getPanelStatus(defaults.mockData.PanelId);
    t.ok(panelStatus, "Expected to receive panel status");
  }
));

test("It should support fetching details about a panel", compose(
  withMockedSectorApi(defaults),
  withApi(defaults),
  async(api, t) => {
    const panelDetails = await api.getPanelDetails(defaults.mockData.PanelId);
    t.equals(panelDetails.PanelId, defaults.mockData.PanelId, "Expected to receive details of a single panel");
  }
));

test("It should support fetching temperature measurements from a panel", compose(
  withMockedSectorApi(defaults),
  withApi(defaults),
  async(api, t) => {
    const panelDetails = await api.getTemperatures(defaults.mockData.PanelId);
    t.equals(panelDetails.length, 1, "Expected to receive temperature measurements");
  }
));

test("It should support updating the settings of a panel", compose(
  withMockedSectorApi(defaults),
  withApi(defaults),
  async(api, t) => {
    await api.setPanelSettings(defaults.mockData.PanelId, defaults.mockData.displayName, true);
  }
));

test("It should support arming the alarm", compose(
  withMockedSectorApi(defaults),
  withApi(defaults),
  async(api, t) => {
    await api.changeAlarmState(
      defaults.mockData.PanelId,
      "Total",
      defaults.mockData.panelCode
    );
    t.pass("Expected the call not to throw");
  }
));

test("It should support partially arming the alarm", compose(
  withMockedSectorApi(defaults),
  withApi(defaults),
  async(api, t) => {
    await api.changeAlarmState(
      defaults.mockData.PanelId,
      "Partial",
      defaults.mockData.panelCode
    );
    t.pass("Expected the call not to throw");
  }
));

test("It should support arming the alarm without specifying the panel code if 'Quick arm' is enabled", compose(
  withMockedSectorApi({ ...defaults, mockData: { ...defaults.mockData, quickArm: true } }),
  withApi(defaults),
  async(api, t) => {
    await api.changeAlarmState(defaults.mockData.PanelId, "Partial");
    t.pass("Expected the call not to throw");
  }
));

test("It should not allow arming the alarm without specifying the panel code if 'Quick arm' is disabled", compose(
  withMockedSectorApi({ ...defaults, mockData: { ...defaults.mockData, quickArm: false } }),
  withApi(defaults),
  async(api, t) => {
    const threwError = await api.changeAlarmState(defaults.mockData.PanelId, "Total").then(() => false).catch(() => true);
    t.ok(threwError, "Expected the call to throw");
  }
));

test("It should support disarming the alarm", compose(
  withMockedSectorApi(defaults),
  withApi(defaults),
  async(api, t) => {
    await api.changeAlarmState(defaults.mockData.PanelId, "Disarm", defaults.mockData.panelCode);
    t.pass("Expected the call not to throw");
  }
));


