import type { WsEnvelope, WsOrigin } from "../../../types/ws.types"

export function uiGetLanCurrent(
  selectedAgentUUID: string,
  origin: WsOrigin
): WsEnvelope<Record<string, never>> {
  return {
    origin,
    request: {
      id: crypto.randomUUID(),
      type: "remote.get.lan.current.request",
      ts: new Date().toISOString(),
    },
    destination: {
      mode: "agent_one",
      agent_uuid: selectedAgentUUID,
    },
    payload: {},
  }
}
