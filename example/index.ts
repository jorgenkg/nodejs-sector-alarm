import { GetPanelListResponse } from "../lib/@types/responses/index.js";
import { SectorApi } from "../lib/SectorApi.js";
import assert from "assert";

(async() => {
  assert(process.env.EMAIL, "Expect EMAIL to be defined");
  assert(process.env.PASSWORD, "Expect PASSWORD to be defined");

  const api = new SectorApi(process.env.EMAIL, process.env.PASSWORD);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const alarmPanels: GetPanelListResponse = await api.getPanelList();
})()
  .catch(console.error);
