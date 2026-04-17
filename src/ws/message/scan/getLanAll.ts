import type { WsEnvelope, WsOrigin } from "../../../types/ws.types"

export function uiGetLanAll(
  selectedAgentUUID: string,
  origin: WsOrigin
): WsEnvelope<Record<string, never>> {
  return {
    origin,
    request: {
      id: crypto.randomUUID(),
      type: "remote.get.lan.all.request",
      ts: new Date().toISOString(),
    },
    destination: {
      mode: "agent_one",
      agent_uuid: selectedAgentUUID,
    },
    payload: {},
  }
}
