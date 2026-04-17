import type { UIGetTaskMessage } from "../../../types/task.type";


export function uiGetTask(agent_uuid?:string): UIGetTaskMessage {
  return {
    request: {
      id: crypto.randomUUID(),
      type: "remote.get.task",
      ts: new Date().toISOString(),
    },
    destination: {
      mode: "agent_one",
      agent_uuid: agent_uuid
    },
    payload: {},
  };
}
