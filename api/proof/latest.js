import { handleOptions, readDataJson, sendJson } from "../_utils.js";

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  sendJson(res, await readDataJson("proof/generated/sample-agent-run.json"));
}
