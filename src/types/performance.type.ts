import type { WsOrigin } from "./ws.types"
export type PerfDiskVolume = {
  TotalBytes: number;
  UsedBytes: number;
  UsedPercent: number;
};

export interface PerfPayload {
  bbird_alloc_mb: number;
  bbird_alloc_rate_mb: number;
  bbird_cpu_pct: number;
  bbird_dropped: number;
  bbird_gc_cycles: number;
  bbird_gc_last_pause_ms: number;
  bbird_gc_total_pause_ms: number;
  bbird_goroutines: number;
  bbird_handle_count: number;
  bbird_heap_mb: number;
  bbird_queue_size: number;
  bbird_read_bytes: number;
  bbird_sys_cpu_pct?: number;
  bbird_sys_disk_total_mb?: number;
  bbird_sys_disk_used_mb?: number;
  bbird_sys_disk_used_pct?: number;
  bbird_sys_disk_volumes?: Record<string, PerfDiskVolume>;
  bbird_sys_mb?: number;
  bbird_sys_mem_total_mb?: number;
  bbird_sys_mem_used_mb?: number;
  bbird_sys_mem_used_pct?: number;
  sys_cpu_pct?: number;
  sys_disk_total_mb?: number;
  sys_disk_used_mb?: number;
  sys_disk_used_pct?: number;
  sys_disk_volumes?: Record<string, PerfDiskVolume>;
  sys_mem_total_mb?: number;
  sys_mem_used_mb?: number;
  sys_mem_used_pct?: number;
  bbird_syscalls_sec: number;
  bbird_syscalls_total: number;
  bbird_threads: number;
  bbird_write_bytes: number;
  key: string;
  timestamp: string;
}

export type PerfOrigin = {
  agent_uuid: string;
  user_uuid: string;
  tenant_uuid: string;
  source: "agent";
};

export interface PerfState {
  history: PerfPayload[];
  latest: PerfPayload | null;
  historyByOrigin: Record<string, PerfPayload[]>;
  latestByOrigin: Record<string, PerfPayload | null>;
  origins: Record<string, PerfOrigin>;
}

export interface PerfLogPacket {
  origin: {
    agent_uuid: string;
    user_uuid: string;
    tenant_uuid: string;
    source: "agent";
  };
  request: {
    id: string;
    type: "ui.perf.logs.update" | "remote.perf.logs.update";
    ts: string;
  };
  destination: {
    mode: "current_agent";
  };
  payload: PerfPayload;
}

export type UiStartPerfMessageType = WSMessage<
  "remote.start.perf.logs",
  {
    agent_uuid?: string
  },
  {
    mode: "current_agent" | "agent_one"
    agent_uuid?: string
  }
>

export type UiStopPerfMessageType = WSMessage<
  "remote.stop.perf.logs",
  {
    agent_uuid?: string
  },
  {
    mode: "current_agent" | "agent_one"
    agent_uuid?: string
  }
>

export interface WSMessage<
  TType extends string,
  TPayload,
  TDestination extends { mode: string } = { mode: string }
> {
  origin: WsOrigin
  request: {
    id: string
    type: TType
    ts: string
  }
  destination: TDestination
  payload: TPayload
}
