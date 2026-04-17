import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { PerfLogPacket, PerfPayload, PerfState } from "../../types/performance.type";
import type { RootState } from "../../store";


const isPerfLogPacket = (value: PerfPayload | PerfLogPacket): value is PerfLogPacket => {
  return typeof value === "object" && value !== null && "payload" in value && "origin" in value;
};

const initialState: PerfState = {
  history: [],
  latest: null,
  historyByOrigin: {},
  latestByOrigin: {},
  origins: {},
};

const MAX_HISTORY = 15; // buffer: tieni solo gli ultimi 15 punti

const perfSlice = createSlice({
  name: "perf",
  initialState,
  reducers: {
    addPerf: (state, action: PayloadAction<PerfPayload | PerfLogPacket>) => {
      let payload: PerfPayload;
      let origin: PerfLogPacket["origin"] | null = null;

      if (isPerfLogPacket(action.payload)) {
        payload = action.payload.payload;
        origin = action.payload.origin;
      } else {
        payload = action.payload;
      }
      const originKey = origin ? origin.agent_uuid : "unknown";
      state.latest = payload;
      state.history.push(payload);

      if (state.history.length > MAX_HISTORY) {
        state.history = state.history.slice(-MAX_HISTORY);
      }

      if (!state.historyByOrigin[originKey]) {
        state.historyByOrigin[originKey] = [];
      }
      state.latestByOrigin[originKey] = payload;
      state.historyByOrigin[originKey].push(payload);

      if (state.historyByOrigin[originKey].length > MAX_HISTORY) {
        state.historyByOrigin[originKey] = state.historyByOrigin[originKey].slice(-MAX_HISTORY);
      }

      if (origin) {
        state.origins[originKey] = origin;
      }
    },
    clearPerf: (state) => {
      state.history = [];
      state.latest = null;
      state.historyByOrigin = {};
      state.latestByOrigin = {};
      state.origins = {};
    },
  },
});

export const { addPerf, clearPerf } = perfSlice.actions;
export default perfSlice.reducer;

export const selectPerfOriginOptions = (state: RootState) => {
  const agentNameById = new Map(
    (state.tenant.agents ?? []).map(agent => [
      agent.agent_uuid,
      agent.agent_name,
    ])
  );

  const historyByOrigin = state.performance?.historyByOrigin ?? {};
  const origins = state.performance?.origins ?? {};

  return Object.keys(historyByOrigin).map(originKey => {
    const origin = origins[originKey];
    const agentUuid = origin?.agent_uuid ?? String(originKey);
    const label = agentNameById.get(agentUuid) ?? agentUuid;
    return { label, value: originKey, agent_uuid: agentUuid };
  });
};
