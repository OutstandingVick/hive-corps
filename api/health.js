import { getHealthPayload, handleOptions, sendJson } from "./_utils.js";

export default function handler(req, res) {
  if (handleOptions(req, res)) return;
  sendJson(res, getHealthPayload());
}
