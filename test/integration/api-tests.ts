import {
  compose,
  defaults,
  test,
  withApi,
  withMockedSectorApi
} from "../test-helpers/index.js";
import { Middleware } from "../test-helpers/compose-types.js";
import FakeTimer from "@sinonjs/fake-timers";

const clock = FakeTimer.createClock();

test("It should support authentication with the user credentials", compose(
  withMockedSectorApi(defaults),
  withApi(defaults),
  async(api, t) => {
    t.ok(await api.login() === undefined, "Expected to successfully sign in");
  }
));

test("It should support fetching information about the user credentials", compose(
  withMockedSectorApi(defaults),
  withApi(defaults),
  async(api, t) => {
    const userInfo = await api.getUserInfo();
    t.ok(userInfo, "Expected to receive user info");
  }
));

test("When the credentials have expired, it should re-authenticate before sending the request", compose(
  (async next => {
    clock.reset();
    clock.setSystemTime(Date.now());
    await next();
  }) as Middleware<undefined>,
  withMockedSectorApi({ ...defaults, clock: clock as FakeTimer.NodeClock }),
  withApi({ ...defaults, clock: clock as FakeTimer.NodeClock }),
  async(api, t) => {
    await api.login();
    await clock.tickAsync("24:00:00");
    const userInfo = await api.getUserInfo();
    t.ok(userInfo, "Expected to receive user info");
  }
));

test("If the credentials have been revoked, it should re-authenticate before sending the request", compose(
  withMockedSectorApi({ ...defaults, clock: clock as FakeTimer.NodeClock }, { expose: true }),
  withApi({ ...defaults, clock: clock as FakeTimer.NodeClock }),
  async(sector, api, t) => {
    await api.login();
    sector.invalidateCookie();
    const userInfo = await api.getUserInfo();
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

test("It should support fetching a panel summary", compose(
  withMockedSectorApi(defaults),
  withApi(defaults),
  async(api, t) => {
    const panelSummary = await api.getPanelOverview(defaults.mockData.PanelId);
    t.equals(panelSummary.Panel.PanelId, defaults.mockData.PanelId, "Expected to receive an overview of a single panel");
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

test("It should support updating the settings of a panel", compose(
  withMockedSectorApi(defaults),
  withApi(defaults),
  async(api, t) => {
    const setPanelSettingsResponse = await api.setPanelSettings(defaults.mockData.PanelId, defaults.mockData.displayName, true);
    t.equals(setPanelSettingsResponse, "success", "Expected to receive a 'success' reply");
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
    await api.changeAlarmState(defaults.mockData.PanelId, "Total");
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


