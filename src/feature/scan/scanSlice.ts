import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { ResolvedTarget, ScanLanStreamPayload, ScanLanStreamState,} from '../../types/scan.type';
import { buildPdfReport } from '../../utlis/buildPdfReport';


interface ScanState {
  resolvedTarget: ResolvedTarget | null;
  scans: ScanLanStreamState[]; // 👈 VETTORE DI SCAN ATTIVE / TERMINATE
  format:Record<string, ScanOutputFormat>;
  scanMeta: Record<string, { target: string; startedAt: number }>;
  stoppedTaskIds: Record<string, true>;
  startedTaskIds: Record<string, true>;
  lastRequestedFormat: ScanOutputFormat | null;
  lastRequestedTarget: string | null;
  progress: Record<string, number>;
}

const initialState: ScanState = {
  resolvedTarget: null,
  scans: [],
  format: {},
  scanMeta: {},
  stoppedTaskIds: {},
  startedTaskIds: {},
  lastRequestedFormat: null,
  lastRequestedTarget: null,
  progress: {}
};


export const scanSlice = createSlice({
  name: 'scan',
  initialState,
  reducers: {
    updateScanStream(
      state,
      action: PayloadAction<ScanLanStreamPayload>
    ) {
      const incoming = action.payload;
      const taskId = incoming.meta.task_id;
      if (state.stoppedTaskIds[taskId]) {
        return;
      }

      const finished =
        incoming.meta.stopped === true ||
        incoming.execution.wave_current >= incoming.execution.waves_total;

      const idx = state.scans.findIndex(
        s => s.meta.task_id === taskId
      );

      const scanState: ScanLanStreamState = {
        ...incoming,
        isRunning: !finished,
        completata: finished,
        executionTime: finished
          ? incoming.execution.elapsed_ms / 1000
          : undefined,
        lastUpdated: Date.now(),
      };

      if (idx === -1) {
        // ➜ START scan (scan.lan.start)
        state.scans.push(scanState);
      } else {
        // ➜ UPDATE / FINISH scan
        state.scans[idx] = {
          ...state.scans[idx],
          ...scanState,
        };
      }
    },

    // ui.get.lan.current / ui.get.lan.all
    resolveLanTarget(state, action: PayloadAction<string>) {
      state.resolvedTarget = {
        previews: [
          {
            kind: "cidr",
            label: action.payload,
          },
        ],
        total_ips_estimated: null,
      };
    },

    // ui.correct.target.ip
    resolveCorrectedTarget(state,action: PayloadAction<ResolvedTarget>) {
      state.resolvedTarget = action.payload;
    },

    eliminateScan(state, action: PayloadAction<string>) {
      const taskId = action.payload;
      const idx = state.scans.findIndex(s => s.meta.task_id === taskId);
      if (idx !== -1) {
        state.scans.splice(idx, 1);
      }
      delete state.format[taskId];
      delete state.scanMeta[taskId];
      delete state.stoppedTaskIds[taskId];
      delete state.startedTaskIds[taskId];
    },


   /*addProgress: (state, action: PayloadAction<any>) => {
      const p = action.payload ?? {};
      
      // [done, total] pairs
      const pairs: Array<[number, number]> = [
        [Number(p.advanced_done ?? 0), Number(p.advanced_total ?? 0)],
        [Number(p.discovery_done ?? 0), Number(p.discovery_total ?? 0)],
        [Number(p.ports_done_tcp ?? 0), Number(p.ports_total_tcp ?? 0)],
        [Number(p.ports_done_udp ?? 0), Number(p.ports_total_udp ?? 0)],
      ];

      let sumDone = 0;
      let sumTotal = 0;

      for (const [doneRaw, total] of pairs) {
        if (total > 0) {
          // clamp: done ∈ [0, total]
          const done = Math.max(0, Math.min(doneRaw, total));
          sumDone += done;
          sumTotal += total;
        }
      }

      const pct = sumTotal > 0 ? (sumDone / sumTotal) : 0;

      // arrotonda a 1 decimale (se vuoi)
      state.progress[scanId] = Math.round(pct * 10) / 10;
    },*/

    setScanOutputFormat(
      state,
      action: PayloadAction<{ task_id: string; format: ScanOutputFormat }>
    ) {
      state.format[action.payload.task_id] = action.payload.format;
    },

    setScanLocalMeta(
      state,
      action: PayloadAction<{ task_id: string; target: string; startedAt: number }>
    ) {
      state.scanMeta[action.payload.task_id] = {
        target: action.payload.target,
        startedAt: action.payload.startedAt,
      };
    },

    setLastRequestedScan(
      state,
      action: PayloadAction<{ format: ScanOutputFormat; target: string }>
    ) {
      state.lastRequestedFormat = action.payload.format;
      state.lastRequestedTarget = action.payload.target;
    },

    markScanStarted(state, action: PayloadAction<string>) {
      state.startedTaskIds[action.payload] = true;
    },

    markScanStopped(state, action: PayloadAction<string>) {
      const taskId = action.payload;
      state.stoppedTaskIds[taskId] = true;
      const idx = state.scans.findIndex(s => s.meta.task_id === taskId);
      if (idx === -1) {
        return;
      }
      const scan = state.scans[idx];
      const startedAt = state.scanMeta[taskId]?.startedAt;
      const executionTime = startedAt
        ? (Date.now() - startedAt) / 1000
        : scan.executionTime;
      state.scans[idx] = {
        ...scan,
        meta: {
          ...scan.meta,
          stopped: true,
        },
        isRunning: false,
        completata: true,
        executionTime,
        lastUpdated: Date.now(),
      };
    },

    resetScans(state) {
      state.scans = [];
      state.format = {};
      state.scanMeta = {};
      state.stoppedTaskIds = {};
      state.startedTaskIds = {};
      state.lastRequestedFormat = null;
      state.lastRequestedTarget = null;
    },

    clearScan(){
      return initialState
    }
  }
  
});

export type ScanOutputFormat = "onlyscreen" | "pdf" | "csv" | "json" | "markdown";
export type FileExtension = "csv" | "json" | "md";

const normalizeReportPayload = (report: any) => {
  if (!report || typeof report !== "object") {
    return report;
  }

  const nested =
    report.report ??
    report.payload ??
    report.data ??
    report.result ??
    report.results ??
    null;

  const source = report.Results || report.Targets || report.Summary || report.hosts
    ? report
    : (nested && typeof nested === "object" ? nested : report);

  const rawHosts = source.Results ?? source.results ?? source.hosts;
  const normalizedHosts = Array.isArray(rawHosts)
    ? rawHosts.map((host: any) => ({
        IP: host.IP ?? host.ip,
        MAC: host.MAC ?? host.mac ?? "",
        Vendor: host.Vendor ?? host.vendor ?? "",
        Hostname: host.Hostname ?? host.hostname ?? "",
        Reachable: host.Reachable ?? host.reachable ?? false,
        TTL: host.TTL ?? host.ttl ?? null,
        RTT:
          typeof host.RTT === "number"
            ? host.RTT
            : typeof host.rtt_ms === "number"
              ? host.rtt_ms * 1_000_000
              : null,
        OSGuess: host.OSGuess ?? host.os_guess ?? "",
        PassiveFingerprint: host.PassiveFingerprint ?? host.PassiveOS ?? host.passive_fingerprint ?? "",
        OpenPortsTCP: host.OpenPortsTCP ?? host.OpenTCP ?? host.tcp_ports ?? {},
        OpenPortsUDP: host.OpenPortsUDP ?? host.OpenUDP ?? host.udp_ports ?? {},
        SourceModule: host.SourceModule ?? host.Sources ?? host.origins ?? [],
        is_self: host.is_self ?? host.IsSelf ?? false,
        ScanTime: host.ScanTime ?? host.scan_time ?? "",
      }))
    : rawHosts;

  return {
    ...source,
    Results: normalizedHosts,
    Targets: source.Targets ?? source.targets,
    Summary: source.Summary ?? source.summary,
    Started: source.Started ?? source.started,
    Ended: source.Ended ?? source.ended,
    ScanID: source.ScanID ?? source.scan_id ?? source.scanId,
  };
};


const downloadContent = (
  content: string,
  fileName: string,
  mimeType: string
) => {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

const formatReportTimestamp = (date: Date) => {
  const dd = String(date.getDate()).padStart(2, "0")
  const mm = String(date.getMonth() + 1).padStart(2, "0")
  const yy = String(date.getFullYear()).slice(-2)
  const hh = String(date.getHours()).padStart(2, "0")
  const mi = String(date.getMinutes()).padStart(2, "0")
  const ss = String(date.getSeconds()).padStart(2, "0")
  // separatori compatibili con i nomi file
  return `${dd}-${mm}-${yy}_${hh}-${mi}-${ss}`
}

const buildReportContent = (
  payload: any,
  format: FileExtension
): {
  extension: FileExtension;
  content: string;
} | null => {
  switch (format) {
    case "csv": {
      if (!payload.Results) return null

      const first = payload.Targets?.[0] ?? ""
      const last = payload.Targets?.[payload.Targets.length - 1] ?? ""
      const targetRange = `${first} - ${last}`

      const header =
        `Targets: ${targetRange}\n` +
        `IP;MAC;Vendor;Hostname;Reachable;TTL;RTT;ScanTime;SourceModule;PassiveFingerprint;OpenPortsTCP;OpenPortsUDP`

      const rows = payload.Results.map((r: any) => {
        const tcp = r.OpenPortsTCP
          ? Object.entries(r.OpenPortsTCP).map(([p, s]) => `${p}:${s}`).join(" | ")
          : ""
        const udp = r.OpenPortsUDP
          ? Object.entries(r.OpenPortsUDP).map(([p, s]) => `${p}:${s}`).join(" | ")
          : ""
        const sourceModules = r.SourceModule?.join("|") ?? ""

        return [
          r.IP,
          r.MAC,
          r.Vendor,
          r.Hostname,
          r.Reachable,
          r.TTL,
          r.RTT,
          r.ScanTime,
          sourceModules,
          r.PassiveFingerprint,
          tcp,
          udp,
        ].join(";")
      })

      const csv = [header, ...rows].join("\n")
      return { extension: "csv", content: csv }
    }
    case "json": {
      return {
        extension: "json",
        content: JSON.stringify(
          {
            scan_id: payload.ScanID,
            started: payload.Started,
            ended: payload.Ended,
            targets_total: payload.Targets?.length || 0,
            summary: payload.Summary,
            hosts: payload.Results.map((host: any) => ({
              ip: host.IP,
              mac: host.MAC || null,
              vendor: host.Vendor || null,
              hostname: host.Hostname || null,
              reachable: host.Reachable || false,
              ttl: host.TTL || null,
              rtt_ms: host.RTT ? Number((host.RTT / 1_000_000).toFixed(2)) : null,
              os_guess: host.OSGuess || null,
              passive_fingerprint: host.PassiveFingerprint || null,
              tcp_ports: host.OpenPortsTCP || {},
              udp_ports: host.OpenPortsUDP || {},
              origins: host.SourceModule || [],
            })),
          },
          null,
          2
        ),
      }
    }
    case "md": {
      return {
        extension: "md",
        content: `# Scan Report

**Scan ID:** ${payload.ScanID}
**Started:** ${payload.Started}
**Ended:** ${payload.Ended}

---

## Summary
- Targets total: ${payload.Summary?.targets_total}
- Raw scanned: ${payload.Summary?.raw_scanned}
- Reachable: ${payload.Summary?.reachable}
- Total hosts: ${payload.Summary?.total_hosts}

---

## Hosts Found
${payload.Results.map((host: any, i: number) => `
### Host ${i + 1}: ${host.IP}
- MAC: ${host.MAC || "-"}
- Vendor: ${host.Vendor || "-"}
- Hostname: ${host.Hostname || "-"}
- Reachable: ${host.Reachable ? "Yes" : "No"}
- TTL: ${host.TTL || "-"}
- RTT: ${host.RTT || "-"}
- Passive Fingerprint: ${host.PassiveFingerprint || "-"}
- Open TCP Ports: ${
  host.OpenPortsTCP && Object.keys(host.OpenPortsTCP).length > 0
    ? Object.entries(host.OpenPortsTCP).map(([p, svc]) => `${p} (${svc})`).join(", ")
    : "-"
}
- Open UDP Ports: ${
  host.OpenPortsUDP && Object.keys(host.OpenPortsUDP).length > 0
    ? Object.entries(host.OpenPortsUDP).map(([p, svc]) => `${p} (${svc})`).join(", ")
    : "-"
}
- Scan Time: ${host.ScanTime}
`).join("\n")}
`,
      }
    }
    default:
      return null
  }
}

const mimeMap: Record<FileExtension, string> = {
  csv: "text/csv;charset=utf-8",
  json: "application/json;charset=utf-8",
  md: "text/markdown;charset=utf-8",
}

// --- THUNK per terminare la scan + salvare il file
export const terminateScanThunk =
  (payload: {
    task_id: string;
    format: ScanOutputFormat;
    report: any;
  }) =>
  async () => {

    const { format, report } = payload;
    const normalizedReport = normalizeReportPayload(report);

    if (format === "onlyscreen") {
      return;
    }

    if (format === "pdf") {
      const fileName = `scan_report_${formatReportTimestamp(new Date())}.pdf`
      buildPdfReport(normalizedReport, { fileName })
      return;
    }

    const fileFormat: FileExtension = format === "markdown" ? "md" : format;
    const info = buildReportContent(normalizedReport, fileFormat);
    if (!info) return;

    const fileName = `scan_report_${formatReportTimestamp(new Date())}.${info.extension}`
    downloadContent(info.content, fileName, mimeMap[info.extension])
  };
export const {
  updateScanStream,
  resolveCorrectedTarget,
  resolveLanTarget,
  /*addProgress,*/
  setScanOutputFormat,
  setScanLocalMeta,
  setLastRequestedScan,
  markScanStarted,
  markScanStopped,
  resetScans,
  eliminateScan,
  clearScan,
} = scanSlice.actions;
export default scanSlice.reducer;
