import type { ScanLanStartPayload, ScanLanStopPayload } from "../../../types/scan.type";
import type { WsEnvelope, WsOrigin } from "../../../types/ws.types";

export function startScan(
  selectedAgentUUID: string,
  origin: WsOrigin,
  payload: ScanLanStartPayload
): WsEnvelope<ScanLanStartPayload> {
  return {
    origin,
    request: {
      id: crypto.randomUUID(),
      type: "scan.lan.remote.start",
      ts: new Date().toISOString(),
    },
    destination: {
      mode: "agent_one",
      agent_uuid: selectedAgentUUID,
    },
    payload,
  }
}

export function uiStopScanMessage(
  task_id:string,
  origin: WsOrigin,
 selectedAgentUUID: string,
): WsEnvelope<ScanLanStopPayload> {
  return {
    origin,
    request: {
      id: crypto.randomUUID(),
      type: "scan.lan.remote.stop",
      ts: new Date().toISOString(),
    },
    destination: {
      mode: "agent_one",
    },
    payload: {
      process_id: task_id,
      agent_uuid: selectedAgentUUID,
    },
  };
}