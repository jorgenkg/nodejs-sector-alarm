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

test("It should support fetching a list of alarm panels", compose(
  withMockedSectorApi(defaults, { PanelId: "123456" }),
  withApi(defaults),
  async(api, t) => {
    const panelList = await api.getPanelList();
    t.equals(panelList[0].PanelId, "123456", "Expected to receive a list of panels with PanelId-s");
  }
));

test("It should support fetching a panel summary", compose(
  withMockedSectorApi(defaults, { PanelId: "123456" }),
  withApi(defaults),
  async(api, t) => {
    const panelSummary = await api.getPanelSummary((await api.getPanelList())[0].PanelId);
    t.equals(panelSummary.Panel.PanelId, "123456", "Expected to receive an overview of a single panel");
  }
));

test("It should support fetching details about a panel", compose(
  withMockedSectorApi(defaults, { PanelId: "123456" }),
  withApi(defaults),
  async(api, t) => {
    const panelDetails = await api.getPanelDetails((await api.getPanelList())[0].PanelId);
    t.equals(panelDetails.PanelId, "123456", "Expected to receive details of a single panel");
  }
));

test("It should support updating the settings of a panel", compose(
  withMockedSectorApi(defaults, { PanelId: "123456" }),
  withApi(defaults),
  async(api, t) => {
    const setPanelSettingsResponse = await api.setPanelSettings((await api.getPanelList())[0].PanelId, "foo", "foo", false);
    t.equals(setPanelSettingsResponse, "success", "Expected to receive a 'success' reply");
  }
));

test("It should support arming the alarm", compose(
  withMockedSectorApi(defaults, { PanelId: "123456", panelCode: "foobar" }),
  withApi(defaults),
  async(api, t) => {
    await api.changeAlarmState(
      (await api.getPanelList())[0].PanelId,
      "Total",
      "foobar"
    );
    t.pass("Expected the call not to throw");
  }
));

test("It should support arming the alarm without specifying the panel code if 'Quick arm' is enabled", compose(
  withMockedSectorApi(defaults, { PanelId: "123456", quickArm: true }),
  withApi(defaults),
  async(api, t) => {
    await api.changeAlarmState("123456", "Total");
    t.pass("Expected the call not to throw");
  }
));

test("It should not allow arming the alarm without specifying the panel code if 'Quick arm' is disabled", compose(
  withMockedSectorApi(defaults, { PanelId: "123456", quickArm: false }),
  withApi(defaults),
  async(api, t) => {
    const threwError = await api.changeAlarmState("123456", "Total").then(() => false).catch(() => true);
    t.ok(threwError, "Expected the call to throw");
  }
));

