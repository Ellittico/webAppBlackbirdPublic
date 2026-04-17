import type { WSMessage } from "./performance.type"

export type UiStartLogMessageType = WSMessage<
  "remote.start.base.logs",
  {
    agent_uuid?: string
  },
  {
    mode: "current_agent" | "agent_one"
    agent_uuid?: string
  }
>

export type UiStopLogMessageType = WSMessage<
  "remote.stop.base.logs",
  {
    agent_uuid?: string
  },
  {
    mode: "current_agent" | "agent_one"
    agent_uuid?: string
  }
>