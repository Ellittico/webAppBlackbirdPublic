import type { WsEnvelope, WsOrigin } from "../../../types/ws.types";

export function stopScan(
  selectedAgentUUID: string,
  origin: WsOrigin,
  taskId: string
): WsEnvelope<{ task_id: string }> {
  return {
    origin,
    request: {
      id: crypto.randomUUID(),
      type: "scan.lan.remote.stop",
      ts: new Date().toISOString(),
    },
    destination: {
      mode: "agent_one",
      agent_uuid: selectedAgentUUID,
    },
    payload: {
      task_id: taskId,
    },
  }
}
