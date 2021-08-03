import * as assert from "assert";
import { PanelListResponse } from "../lib/@types/PanelListResponse";
import { SectorApi } from "../lib/SectorApi.js";

(async() => {
  assert(process.env.EMAIL, "Expect EMAIL to be defined");
  assert(process.env.PASSWORD, "Expect PASSWORD to be defined");

  const api = new SectorApi(process.env.EMAIL, process.env.PASSWORD);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const vehicles: PanelListResponse = await api.getPanelList();
})()
  .catch(console.error);
