import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { RemoteAgentPayload } from "../../types/remoteAgent.types"

type RemoteAgentState = {
  agents: RemoteAgentPayload[]
}

const initialState: RemoteAgentState = {
  agents: [],
}

const getAgentKey = (agent: RemoteAgentPayload) =>
  agent.agent_id || agent.id

const remoteAgentSlice = createSlice({
  name: "remoteAgent",
  initialState,
  reducers: {
    upsertRemoteAgent(state, action: PayloadAction<RemoteAgentPayload>) {
      const incoming = action.payload
      const key = getAgentKey(incoming)
      if (!key) return

      const idx = state.agents.findIndex(a => getAgentKey(a) === key)
      if (idx === -1) {
        state.agents.push(incoming)
      } else {
        state.agents[idx] = incoming
      }
    },
  removeRemoteAgent(state, action: PayloadAction<string>) {
    const agentId = action.payload
    state.agents = state.agents.filter(
      a => getAgentKey(a) !== agentId
    )
  },

    clearRemoteAgents() {
      return initialState
    },
  },
})

export const { upsertRemoteAgent, clearRemoteAgents,removeRemoteAgent } =
  remoteAgentSlice.actions
export default remoteAgentSlice.reducer
