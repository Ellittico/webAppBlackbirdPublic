
import type { AppThunk } from "../../store"
import { sendMessage } from "../../ws/tenantSocket"

export const respondToHelloWorldThunk =
  (helloMsg: any): AppThunk =>
  (dispatch, getState) => {
    const state = getState()

    const agentUuid = state.tenant.thisAgentUuid
    const userUuid = state.auth.userId
    const tenantUuid = state.tenant.info?.tenant_id

    // 🚦 Redux NON pronto → riprova
    if (!agentUuid || !userUuid || !tenantUuid) {
      setTimeout(() => {
        dispatch(respondToHelloWorldThunk(helloMsg))
      }, 100)
      return
    }

    const response = {
      origin: {
        agent_uuid: agentUuid,
        user_uuid: userUuid,
        tenant_uuid: tenantUuid,
        source: "ui",
      },
      request: {
        id: crypto.randomUUID(),
        type: "i.want.a.fkg.update",
        ts: new Date().toISOString(),
      },
      destination: {
        mode: "tenant_agents",
        agent_uuid: "",
      },
      payload: {},
    }

    sendMessage(response)
    //console.log("inviato")
  }
