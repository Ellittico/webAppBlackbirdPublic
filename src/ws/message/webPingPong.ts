import type { WsEnvelope, WsOrigin } from "../../types/ws.types"

export function pingPong(origin: WsOrigin): WsEnvelope<Record<string, never>> {
  return {
    origin,
    request: {
      id: crypto.randomUUID(),
      type: "server.ping",
      ts: new Date().toISOString(),
    },
    destination: {
      mode: "server",
      agent_uuid: "",
    },
    payload: {},
  }
}
