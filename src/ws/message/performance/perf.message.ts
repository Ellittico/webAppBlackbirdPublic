import type { UiStartPerfMessageType, UiStopPerfMessageType } from "../../../types/performance.type"
import type { WsOrigin } from "../../../types/ws.types"



export function startPerfMessage(origin: WsOrigin, agent_uuid?: string): UiStartPerfMessageType {
 return{
  origin,
  request: {
     id: crypto.randomUUID(),
    type: "remote.start.perf.logs",
    ts:  new Date().toISOString()
   },
  destination: {
    mode: "agent_one",
    agent_uuid: agent_uuid
  },
  payload: {}
}
}

export function stopPerfMessage(origin: WsOrigin, agent_uuid?: string): UiStopPerfMessageType {
 return{
  origin,
  request: {
    id: crypto.randomUUID(),
    type: "remote.stop.perf.logs",
    ts: new Date().toISOString()
   },
  destination: {
    mode: "agent_one",
    agent_uuid:  agent_uuid
  },
  payload: {}
}
}
