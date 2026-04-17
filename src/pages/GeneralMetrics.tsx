import { useEffect, useMemo, useRef, useState } from "react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart} from "recharts";

import { useSelector } from "react-redux";

//TRADUZIONI
import { useTranslation } from "react-i18next";
import { FaChevronDown, FaChevronUp} from "react-icons/fa";
import type { RootState } from "../store";
import GenerealMetricsCard from "../components-single/card/GeneralMetricsCard";
import { selectPerfOriginOptions } from "../feature/performance/performanceSlice";
import { useIsMobile } from "../utlis/useIsMobile";

const GeneralMetrics: React.FC = () => {

  const { t } = useTranslation();

  // --- DATA 

  const tenantAgents = useSelector((state:RootState) => state.tenant.agents)
  const historyByOrigin = useSelector((state: RootState) => state.performance.historyByOrigin);
  const latestByOrigin = useSelector((state: RootState) => state.performance.latestByOrigin);

  const [selectedOriginKey, setSelectedOriginKey] = useState<string | null>(null);
  const [selectedSince, setSelectedSince] = useState<number | null>(null);
  const [nowTick, setNowTick] = useState(0);
  const [perfRequested] = useState(false);
  const [showRamMetrics, setShowRamMetrics] = useState(true);
  const [showBlackbirdMetrics, setShowBlackbirdMetrics] = useState(true);
  const [showSysMetrics, setShowSysMetrics] = useState(true);
  const [showWorkspaceAgents, setShowWorkspaceAgents] = useState(false);
  const workspaceAgentsRef = useRef<HTMLDivElement | null>(null);
  const rawData = selectedOriginKey ? (historyByOrigin[selectedOriginKey] ?? []) : [];
  const hasPerfData =
    Object.keys(historyByOrigin ?? {}).length > 0 ||
    Object.keys(latestByOrigin ?? {}).length > 0;

  //controllo tempistica
  const data = useMemo(() => {
    if (selectedSince === null) return rawData;
    return rawData.filter((pkt) => {
      const ts = Date.parse(pkt.timestamp);
      return Number.isFinite(ts) && ts >= selectedSince;
    });
  }, [rawData, selectedSince]);

  const latest = data.length > 0 ? data[data.length - 1] : null;
  const sysCpuPct = latest?.bbird_sys_cpu_pct ?? latest?.sys_cpu_pct;
  const sysMemUsedMb = latest?.bbird_sys_mem_used_mb ?? latest?.sys_mem_used_mb;
  const sysMemTotalMb = latest?.bbird_sys_mem_total_mb ?? latest?.sys_mem_total_mb;
  const sysDiskVolumes = latest?.bbird_sys_disk_volumes ?? latest?.sys_disk_volumes;
  const perfOriginOptions = useSelector(selectPerfOriginOptions);
  const MAX_POINTS = 50; 
  const RECENT_MS = 20_000;

  const visibleOriginOptions = useMemo(() => {
    if (!perfRequested) return perfOriginOptions;
    const now = nowTick || Date.now();
    return perfOriginOptions.filter((opt) => {
      const latestForOrigin = latestByOrigin[opt.value];
      const latestTs = latestForOrigin ? Date.parse(latestForOrigin.timestamp) : NaN;
      return Number.isFinite(latestTs) && (now - latestTs) <= RECENT_MS;
    });
  }, [perfOriginOptions, latestByOrigin, nowTick, perfRequested]);

  useEffect(() => {
    if (selectedOriginKey && visibleOriginOptions.some(o => o.value === selectedOriginKey)) {
      return;
    }
    if (visibleOriginOptions.length === 0) {
      return;
    }
    setSelectedOriginKey(visibleOriginOptions[0].value);
  }, [visibleOriginOptions, selectedOriginKey]);

  useEffect(() => {
    const id = setInterval(() => setNowTick(Date.now()), 2000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!showWorkspaceAgents) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (workspaceAgentsRef.current?.contains(target)) return;
      setShowWorkspaceAgents(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showWorkspaceAgents]);

  const resetUiDataForSelection = (value: string) => {
    if (value === selectedOriginKey) return;
    setSelectedOriginKey(value);
    setSelectedSince(Date.now() - RECENT_MS);
  };

  // --- DATASETS ottimizzati con useMemo
  const ramData = useMemo(() => {
    return data.slice(-MAX_POINTS).map((d, i) => ({
      time: i,
      ram_percent: (d.bbird_alloc_rate_mb / d.bbird_alloc_mb) * 100,
      ram_mb: d.bbird_alloc_rate_mb,
      ram_total: d.bbird_alloc_mb,
    }));
  }, [data]);

  const gcCycles = useMemo(()=>{
    return data.slice(-MAX_POINTS).map((d, i) => ({
      time: i,
      gc_cycles: d.bbird_gc_cycles,
    }));
  }, [data]);
  const goroutinesData = useMemo(() => {
    return data.slice(-MAX_POINTS).map((d, i) => ({
      time: i,
      goroutines: d.bbird_goroutines,
    }));
  }, [data]);
  const cpuData = useMemo(() => {
    return data.slice(-MAX_POINTS).map((d, i) => ({
      time: i,
      cpu_pct: d.bbird_sys_cpu_pct ?? d.sys_cpu_pct,
    }));
  }, [data]);
  const agentCpuData = useMemo(() => {
    return data.slice(-MAX_POINTS).map((d, i) => ({
      time: i,
      cpu_pct: d.bbird_cpu_pct,
    }));
  }, [data]);
  const sysMbData = useMemo(() => {
    return data.slice(-MAX_POINTS).map((d, i) => ({
      time: i,
      sys_mb: d.bbird_sys_mb,
      sys_mb_total: d.bbird_sys_mem_total_mb ?? d.sys_mem_total_mb,
    }));
  }, [data]);
  const ramDataSys = useMemo(() => {
    return data.slice(-MAX_POINTS).map((d, i) => ({
      time: i,
      ram_percent: d.bbird_sys_mem_used_pct ?? d.sys_mem_used_pct,
      ram_mb: d.bbird_sys_mem_used_mb ?? d.sys_mem_used_mb,
      ram_total: d.bbird_sys_mem_total_mb ?? d.sys_mem_total_mb,
    }));
  }, [data]);


  // --- Tooltips
  const RamCustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const percent = payload[0].value;
      const ramMB = payload[0].payload.ram_mb;
      const ramTotal = payload[0].payload.ram_total;
      const hasValues =
        typeof percent === "number" &&
        typeof ramMB === "number" &&
        typeof ramTotal === "number";

      return (
        <div className="text-[0.8rem]" style={{ background: "rgba(0,0,0,0.7)", padding: "6px 10px", borderRadius: "6px", color: "#fff" }}>
          <div>{hasValues ? `${percent.toFixed(3)}%` : "--"}</div>
          <div>{hasValues ? `${ramMB.toFixed(3)} MB / ${ramTotal.toFixed(3)} MB` : "--"}</div>
        </div>
      );
    }
    return null;
  };

  const RamSysCustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const percent = payload[0].value;
      const ramMB = payload[0].payload.ram_mb;
      const ramTotal = payload[0].payload.ram_total;
      const hasValues =
        typeof percent === "number" &&
        typeof ramMB === "number" &&
        typeof ramTotal === "number";

      return (
        <div className="text-[0.8rem]" style={{ background: "rgba(0,0,0,0.7)", padding: "6px 10px", borderRadius: "6px", color: "#fff" }}>
          <div>{hasValues ? `${percent.toFixed(3)}%` : "--"}</div>
          <div>{hasValues ? `${(ramMB/1000).toFixed(3)} GB / ${(ramTotal/1000).toFixed(3)} GB` : "--"}</div>
        </div>
      );
    }
    return null;
  };

  const GcCyclesCustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const cycles = payload[0].value;
      return (
        <div className="text-[0.8rem]" style={{ background: "rgba(0,0,0,0.7)", padding: "6px 10px", borderRadius: "6px", color: "#fff" }}>
          <div>{typeof cycles === "number" ? cycles.toFixed(3) : "--"}</div>
        </div>
      );
    }
    return null;
  };

  const GoroutinesCustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const goroutines = payload[0].value;
      return (
        <div className="text-[0.8rem]" style={{ background: "rgba(0,0,0,0.7)", padding: "6px 10px", borderRadius: "6px", color: "#fff" }}>
          <div>{typeof goroutines === "number" ? goroutines.toFixed(3) : "--"}</div>
        </div>
      );
    }
    return null;
  };

  const CpuCustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const cpu = payload[0].value;
      return (
        <div className="text-[0.8rem]" style={{ background: "rgba(0,0,0,0.7)", padding: "6px 10px", borderRadius: "6px", color: "#fff" }}>
          <div>{typeof cpu === "number" ? `${cpu.toFixed(3)}%` : "--"}</div>
        </div>
      );
    }
    return null;
  };

  const AgentCpuCustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const cpu = payload[0].value;
      return (
        <div className="text-[0.8rem]" style={{ background: "rgba(0,0,0,0.7)", padding: "6px 10px", borderRadius: "6px", color: "#fff" }}>
          <div>{typeof cpu === "number" ? `${cpu.toFixed(3)}%` : "--"}</div>
        </div>
      );
    }
    return null;
  };

  const SysMbCustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const mb = payload[0].value;
      const total = payload[0].payload?.sys_mb_total;
      return (
        <div className="text-[0.8rem]" style={{ background: "rgba(0,0,0,0.7)", padding: "6px 10px", borderRadius: "6px", color: "#fff" }}>
          <div>
            {typeof mb === "number"
              ? `${mb.toFixed(3)} MB${typeof total === "number" ? ` / ${total.toFixed(3)} MB` : ""}`
              : "--"}
          </div>
        </div>
      );
    }
    return null;
  };

  //DEBUG
  const isMobile = useIsMobile(1000)

  return (
    <div className="h-[calc(100vh-80px)] dark:bg-[#2d2d2d] py-1 overflow-hidden">
      <div className="h-full flex flex-col min-h-0 overflow-y-auto">
      <p className="module-title fzen text-left flex flex-row align-center" >
        {t("performance.title")} 
      </p>
      <div className={`flex ${isMobile ? "flex-col ": "flex-row "} flex-1 min-h-0 pb-4 pr-2`}>    

        <div className={`flex  ${isMobile ? " ": "max-w-75 "} flex-col mt-2 `}>
          <div className="flex flex-col px-6  mx-3">
            <p className="text-[#112189] dark:text-gray-200 text-[0.8rem] text-left">{t("performance.selectAgent")}</p>
            <select
               className="bg-[#e0f0fd] dark:bg-[#1e1e1e] text-[#112189] dark:text-gray-200 text-sm px-3 py-1.5 rounded-md border border-[#c7d7f5] dark:border-[#2e2e2e]
                          focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] hover:border-[#3b82f6]
                          transition-colors cursor-pointer disabled:bg-[#474747] w-[250px] truncate"
               value={selectedOriginKey ?? ""}
               onChange={(e) => {resetUiDataForSelection(e.target.value)}}
               disabled={visibleOriginOptions.length === 0}
              >
              {visibleOriginOptions.length === 0 ? (
                <option value="" disabled>
                  {t("performance.noData")}
                </option>
              ) : (
                visibleOriginOptions.map((opt) => (
                  <option className="w-[220px] truncate" key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))
              )}
            </select>
          </div>
          <div
            ref={workspaceAgentsRef}
            className="relative flex flex-1 flex-col items-center bg-[#e6efff] dark:bg-[#3b3b3b] w-max  my-2 text-[0.8rem] rounded-md gap-1 p-1 mx-auto"
          >
              {isMobile ? (
                <>
                  <button
                    type="button"
                    onClick={() => setShowWorkspaceAgents(v => !v)}
                    className="w-[266px] flex flex-row items-center justify-between px-2  text-[#112189] dark:text-gray-200 p-1"
                  >
                    <span>{t("performance.workspaceAgents")}</span>
                    {showWorkspaceAgents ? <FaChevronUp/> : <FaChevronDown/>}
                  </button>
                  {showWorkspaceAgents && (
                    <div className="absolute left-0 top-[42px] z-40 w-[274px] max-h-[50vh] overflow-y-auto flex flex-col gap-1 bg-[#e6efff] dark:bg-[#3b3b3b] rounded-md shadow-lg p-2">
                      {tenantAgents && tenantAgents.map((t) => {
                        return (
                          <GenerealMetricsCard 
                            key={t.agent_uuid}
                            agent={t} 
                            
                            isCurrentAgent={false}
                          />
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <p className="text-left w-[256px] px-2 pb-2 text-[#112189] dark:text-gray-200"> {t("performance.workspaceAgents")}</p>
                  {tenantAgents && tenantAgents.map((t) => {
                    return (
                      <GenerealMetricsCard 
                        key={t.agent_uuid}
                        agent={t} 
                        
                        isCurrentAgent={false}
                      />
                    );
                  })}
                </>
              )}
          </div>
        </div>
        
        <div className={`flex flex-col w-full ${isMobile ? "min-h-[90vh]" : ""} bg-[#eef4ff] dark:bg-[#272727] rounded-sm px-2 h-full flex-1 min-h-0 overflow-y-auto mainApp-scroll`}>
          {!hasPerfData ? (
            <div className="flex  items-center justify-center h-full min-h-[50vh] bg-gradient-to-b bg-[#2e2e2e] from-[#00000000] to-[#0003089d]">
              <div className="bg-slate-500/20 text-gray-300 px-6 py-5 rounded-md text-center border border-indigo-400/30">
                <p className="text-lg font-semibold mb-3">{t("performance.noData")} <br/>
                  <span className="text-gray-400 font-thin text-[0.85rem]">{t("performance.startRealtime")}</span>
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className={`flex ${isMobile ? "flex-wrap-reverse" : "mx-auto min-w-[600px]"} flex-row mt-2 gap-2`}>
                  <div className={` ${isMobile ? "w-full" : "w-[49%] min-w-72.5"}  bg-[#e6efff] dark:bg-[#3b3b3b] h-53 rounded-sm p-2 overflow-x-hidden mainApp-scroll flex flex-col items-start jusify-center gap-1`}>
                    <p className="text-[0.8rem] text-left text-[#112189] dark:text-gray-200">{t("performance.diskInstalled")}</p>
                    <div className="w-full h-1.5 rounded-sm bg-[#cfe0fb] dark:bg-[#2e2e2e] overflow-hidden">
                      <div
                        className="h-full bg-[#0075D1]"
                        style={{
                          width:
                            typeof latest?.bbird_sys_disk_used_pct === "number"
                              ? `${Math.min(100, Math.max(0, latest.bbird_sys_disk_used_pct))}%`
                              : typeof latest?.sys_disk_used_pct === "number"
                                ? `${Math.min(100, Math.max(0, latest.sys_disk_used_pct))}%`
                                : "0%",
                        }}
                      />
                    </div>
                    <div className="text-[0.75rem] text-[#112189] dark:text-gray-200">
                      {typeof latest?.bbird_sys_disk_used_pct === "number"
                        ? `${latest.bbird_sys_disk_used_pct.toFixed(2)}%`
                        : typeof latest?.sys_disk_used_pct === "number"
                          ? `${latest.sys_disk_used_pct.toFixed(2)}%`
                          : "--"}
                    </div>
                    <div className="w-full max-h-[200px] overflow-y-auto mainApp-scroll px-1">
                    {latest
                      ? Object.entries(sysDiskVolumes ?? {}).map(([volume, info]) => (
                          <div key={volume} className="text-[0.75rem] text-[#112189] dark:text-white mb-2 bg-[#dfe9ff] dark:bg-[#2e2e2e] rounded-sm w-full flex flex-row p-2 gap-3">
                            <div className="font-semibold">{volume}</div>
                            <div className="text-[#1D4ED8] dark:text-blue-200">{info.UsedPercent.toFixed(2)}%</div>
                            <div className="ml-auto text-[#112189] dark:text-gray-200">
                              {(info.UsedBytes / 1024 / 1024 / 1024).toFixed(2)} GB <span>/ </span>
                              {(info.TotalBytes / 1024 / 1024 / 1024).toFixed(2)} GB
                            </div>
                          </div>
                        ))
                      : <span className="text-[#112189] dark:text-gray-400 text-[0.75rem]">--</span>
                    }
                    </div>

                  </div>
                  <div className="h-max w-max bg-[#dfe9ff] dark:bg-[#3c3c3c] p-2 rounded-sm px-4">
                    <p className="text-[0.85rem] text-left text-[#112189] dark:text-gray-200 bg-[#313030] px-3 py-1 rounded-sm">
                      <span className="font-semibold  dark:text-blue-300  text-[0.9rem]">{t("performance.updatedAt")} </span>
                      {latest
                        ? new Date(latest.timestamp).toLocaleString("it-IT", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })
                        : "--"}
                    </p>

                  <p className="text-[0.85rem] text-left text-[#112189] dark:text-gray-200  bg-[#313030] px-3 py-1 rounded-sm mt-1"> 
                    <span className="font-semibold  dark:text-blue-300  text-[0.8rem]"> {t("performance.readByte")}: </span>
                    {typeof latest?.bbird_read_bytes === "number"
                      ? latest.bbird_read_bytes >= 1_000_000
                        ? `${(latest.bbird_read_bytes / 1_000_000).toFixed(3)} MB`
                        : latest.bbird_read_bytes >= 1_000
                          ? `${(latest.bbird_read_bytes / 1_000).toFixed(3)} kB`
                          : `${latest.bbird_read_bytes.toFixed(3)} B`
                      : "--"}
                  </p>
                  <p className="text-[0.85rem] text-left text-[#112189] dark:text-gray-200  bg-[#313030] px-3 py-1 rounded-sm mt-1"> 
                    <span className="font-semibold  dark:text-blue-300  text-[0.8rem]"> {t("performance.wroteByte")}: </span>
                    {typeof latest?.bbird_write_bytes === "number"
                      ? latest.bbird_write_bytes >= 1_000_000
                        ? `${(latest.bbird_write_bytes / 1_000_000).toFixed(3)} MB`
                        : latest.bbird_write_bytes >= 1_000
                          ? `${(latest.bbird_write_bytes / 1_000).toFixed(3)} kB`
                          : `${latest.bbird_write_bytes.toFixed(3)} B`
                      : "--"}
                  </p>
                  </div>
              </div>
              <div className={`flex flex-row flex-wrap ${isMobile ? "" : "mx-auto"} gap-2 h-max mt-2 max-w-[100vh] w-full mainApp-scroll pb-2`}>
                <div className="w-full">
                  <button
                    type="button"
                    onClick={() => setShowRamMetrics((v) => !v)}
                    className="w-full flex flex-row justify-between items-center text-left text-[0.85rem] font-semibold text-[#112189] dark:text-gray-200 bg-[#dfe9ff] dark:bg-[#313235] px-3 py-2 rounded-sm"
                  >
                    {t("performance.usageBlackbird")}
                    {showRamMetrics ? <FaChevronUp/> :<FaChevronDown/>}
                  </button>
                  {showRamMetrics && (
                    <div className={`flex  ${isMobile ? "flex-col" : "flex-row"} flex-wrap gap-2 h-max mt-1 bg-[#313235] px-1 py-1 rounded-sm`}>
                      {/* RAM BLACKBIRD*/}
                      <div className="dark:bg-[#3c3c3c] bg-[#f4f8ff] shadow p-2 flex-1 min-w-72.5 px-5 h-max rounded-sm">
                        <h2 className="font-semibold mb-2 text-[#112189] dark:text-white text-[0.8rem] flex flex-col text-left">
                          {t("performance.ramUsageBbird")}
                          <span className="dark:text-gray-300 text-[#112189] ml-4 text-[0.8rem] text-right">
                            {typeof latest?.bbird_sys_mb === "number"
                              ? `${latest.bbird_sys_mb.toFixed(3)} MB / ${typeof sysMemTotalMb === "number" ? sysMemTotalMb.toFixed(3) : "--"} MB`
                              : "--"}
                          </span>
                        </h2>
                        <ResponsiveContainer width={"100%"} height={150}>
                          <AreaChart data={sysMbData}>
                            <defs>
                              <linearGradient id="colorSysMb" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#f472b6" stopOpacity={1} />
                                <stop offset="100%" stopColor="#9d174d" stopOpacity={1} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" hide />
                            <YAxis tick={{ fontSize: 11, fill: "#ccc" }} />
                            <Tooltip content={<SysMbCustomTooltip />} />
                          <Area
                            type="monotone"
                            dataKey="sys_mb"
                            stroke="#f472b6"
                            fillOpacity={1}
                            fill="url(#colorSysMb)"
                            isAnimationActive={false}
                            dot={false}
                          />
                          <Area
                            type="monotone"
                            dataKey="sys_mb_total"
                            stroke="#9ca3af"
                            fillOpacity={0}
                            isAnimationActive={false}
                            dot={false}
                          />
                        </AreaChart>
                        </ResponsiveContainer>
                      </div>

                      {/* CPU BLACKBIRD */}
                      <div className="dark:bg-[#3c3c3c] bg-[#f4f8ff] shadow p-2 flex-1 min-w-72.5 px-5 h-max rounded-sm">
                        <h2 className="font-semibold mb-2 text-[#112189] dark:text-white text-[0.8rem] flex flex-col text-left">
                          {t("performance.cpuUsageBbird")}
                          <span className="dark:text-gray-300 text-[#112189] ml-4 text-[0.8rem] text-right">
                            {typeof latest?.bbird_cpu_pct === "number" ? `Usage: ${latest.bbird_cpu_pct.toFixed(3)}%` : "--"}
                          </span>
                        </h2>
                        <ResponsiveContainer width={"100%"} height={150}>
                          <AreaChart data={agentCpuData}>
                            <defs>
                              <linearGradient id="colorAgentCpu" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#22c55e" stopOpacity={1} />
                                <stop offset="100%" stopColor="#15803d" stopOpacity={1} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" hide />
                            <YAxis tick={{ fontSize: 11, fill: "#ccc" }} unit="%" domain={[0, 100]} />
                            <Tooltip content={<AgentCpuCustomTooltip />} />
                            <Area
                              type="monotone"
                              dataKey="cpu_pct"
                              stroke="#22c55e"
                              fillOpacity={1}
                              fill="url(#colorAgentCpu)"
                              isAnimationActive={false}
                              dot={false}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>


                    </div>
                  )}
                </div>
                <div className="w-full">
                <button
                  type="button"
                  onClick={() => setShowBlackbirdMetrics((v) => !v)}
                  className="w-full flex flex-row justify-between items-center text-left text-[0.85rem] font-semibold text-[#112189] dark:text-gray-200 bg-[#dfe9ff] dark:bg-[#313235] px-3 py-2 rounded-sm"
                >
                 {t("performance.routinesBlackbird")}
                  {showBlackbirdMetrics ? <FaChevronUp/> :<FaChevronDown/>}
                </button>
                {showBlackbirdMetrics && (
                  <div className={`flex  ${isMobile ? "flex-col" : "flex-row"} flex-wrap gap-2 h-max mt-1 bg-[#313235] px-1 py-1 rounded-sm`}>
                    {/* GC CYCLES */}
                    <div className="dark:bg-[#3c3c3c] bg-[#f4f8ff] shadow p-2 flex-1 min-w-72.5 px-5 h-max rounded-sm">
                      <h2 className="font-semibold mb-2 text-[#112189] dark:text-white text-[0.8rem] flex flex-col text-left">
                        {t("performance.gcCycles")}
                        <span className="dark:text-gray-300 text-[#112189] ml-4 text-[0.8rem] text-right">
                          {typeof latest?.bbird_gc_cycles === "number"
                            ? ` ${t("performance.gcCycles")}: ${latest.bbird_gc_cycles.toFixed(0)}  `
                            : " -- "}
                            {latest?.bbird_gc_total_pause_ms &&
                            `|  ${t("performance.totalPause")}: ${latest.bbird_gc_total_pause_ms.toFixed(3)} ms`

                            }
                        </span>
                      </h2>
                      <ResponsiveContainer width={"100%"} height={150}>
                        <AreaChart data={gcCycles}>
                          <defs>
                            <linearGradient id="colorGc" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#f59e0b" stopOpacity={1} />
                              <stop offset="100%" stopColor="#92400e" stopOpacity={1} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="time" hide />
                          <YAxis
                            tick={{ fontSize: 11, fill: "#ccc" }}
                            domain={[0, (dataMax: number) => dataMax + 50]}
                          />
                          <Tooltip content={<GcCyclesCustomTooltip />} />
                          <Area
                            type="monotone"
                            dataKey="gc_cycles"
                            stroke="#f59e0b"
                            fillOpacity={1}
                            fill="url(#colorGc)"
                            isAnimationActive={false}
                            dot={false}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    {/* GOROUTINES */}
                    <div className="dark:bg-[#3c3c3c] bg-[#f4f8ff] shadow p-2 flex-1 min-w-72.5 px-5 h-max rounded-sm">
                      <h2 className="font-semibold mb-2 text-[#112189] dark:text-white text-[0.8rem] flex flex-col text-left">
                        {t("performance.goroutines")}
                        <span className="dark:text-gray-300 text-[#112189] ml-4 text-[0.8rem] text-right">
                          {typeof latest?.bbird_goroutines === "number"
                            ? `GoRoutines: ${latest.bbird_goroutines.toFixed(0)}`
                            : "--"}
                        </span>
                      </h2>
                      <ResponsiveContainer width={"100%"} height={150}>
                        <AreaChart data={goroutinesData}>
                          <defs>
                            <linearGradient id="colorGoroutines" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                              <stop offset="100%" stopColor="#065f46" stopOpacity={1} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="time" hide />
                          <YAxis
                            tick={{ fontSize: 11, fill: "#ccc" }}
                            domain={[0, (dataMax: number) => dataMax + 50]}
                          />
                          <Tooltip content={<GoroutinesCustomTooltip />} />
                          <Area
                            type="monotone"
                            dataKey="goroutines"
                            stroke="#10b981"
                            fillOpacity={1}
                            fill="url(#colorGoroutines)"
                            isAnimationActive={false}
                            dot={false}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
                </div>
                <div className="w-full">
                  <button
                    type="button"
                    onClick={() => setShowSysMetrics((v) => !v)}
                    className="w-full flex flex-row justify-between items-center text-left text-[0.85rem] font-semibold text-[#112189] dark:text-gray-200 bg-[#dfe9ff] dark:bg-[#313235] px-3 py-2 rounded-sm"
                  >
                    {t("performance.usageSystem")}
                    {showSysMetrics ? <FaChevronUp/> :<FaChevronDown/>}
                  </button>
                   {showSysMetrics && (
                      <div className={`flex flex-col flex-wrap gap-2 h-max mt-1 bg-[#313235] px-1 py-1 rounded-sm`}>
                        <div className={`flex  ${isMobile ? "flex-col" : "flex-row"} flex-wrap gap-2`}>
                          {/* RAM SYSTEM*/}
                          <div className="dark:bg-[#3c3c3c] bg-[#f4f8ff] shadow p-2 flex-1 min-w-72.5  px-5 h-max rounded-sm">
                            <h2 className="font-semibold mb-2 text-[#112189] dark:text-white text-[0.8rem] flex flex-col text-left">
                            {t("performance.ramUsage")} 
                              <span className="dark:text-gray-300 text-[#112189]  ml-4 text-[0.8rem] text-right">
                                {latest && typeof sysMemUsedMb === "number" && typeof sysMemTotalMb === "number"
                                  ? `${(sysMemUsedMb / 1000).toFixed(3)} GB su ${(sysMemTotalMb / 1000).toFixed(3)} GB `
                                  : "--"}
                              </span>
                            </h2>
                            <ResponsiveContainer width={"100%"} height={150}>
                              <AreaChart data={ramDataSys}>
                                <defs>
                                  <linearGradient id="colorRamSys" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#4f46e5" stopOpacity={1} />
                                    <stop offset="100%" stopColor="#a855f7" stopOpacity={1} />
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="time" hide />
                                <YAxis tick={{ fontSize: 11, fill: "#ccc" }} unit="%" domain={[0, 100]} />
                                <Tooltip content={<RamSysCustomTooltip />} />
                                <Area
                                  type="monotone"
                                  dataKey="ram_percent"
                                  stroke="#8884d8"
                                  fillOpacity={1}
                                  fill="url(#colorRamSys)"
                                  isAnimationActive={false}
                                  dot={false}
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                            {/* SYSTEM MB */}
                          <div className="dark:bg-[#3c3c3c] bg-[#f4f8ff] shadow p-2 flex-1 min-w-72.5  px-5 h-max rounded-sm">
                            <h2 className="font-semibold mb-2 text-[#112189] dark:text-white text-[0.8rem] flex flex-col text-left">
                           {t("performance.memAllocated")}
                              <span className="dark:text-gray-300 text-[#112189]  ml-4 text-[0.8rem] text-right">
                                {typeof latest?.bbird_alloc_rate_mb === "number" && typeof latest?.bbird_alloc_mb === "number"
                                  ? `${latest.bbird_alloc_rate_mb.toFixed(3)} MB su ${latest.bbird_alloc_mb.toFixed(3)} MB `
                                  : "--"}
                              </span>
                            </h2>
                            <ResponsiveContainer width={"100%"} height={150}>
                              <AreaChart data={ramData}>
                                <defs>
                                  <linearGradient id="colorRam" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#a7f3d0" stopOpacity={1} />
                                    <stop offset="100%" stopColor="#047857" stopOpacity={1} />
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="time" hide />
                                <YAxis tick={{ fontSize: 11, fill: "#ccc" }} unit="%" domain={[0, 100]} />
                                <Tooltip content={<RamCustomTooltip />} />
                                <Area
                                  type="monotone"
                                  dataKey="ram_percent"
                                  stroke="#82ca9d"
                                  fillOpacity={1}
                                  fill="url(#colorRam)"
                                  isAnimationActive={false}
                                  dot={false}
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                      </div>
                      {/* CPU SYSTEM */}
                      <div className="dark:bg-[#3c3c3c] bg-[#f4f8ff] shadow p-2 flex-1 min-w-72.5 px-5 h-max rounded-sm">
                        <h2 className="font-semibold mb-2 text-[#112189] dark:text-white text-[0.8rem] flex flex-col text-left">
                           {t("performance.usage")} CPU
                          <span className="dark:text-gray-300 text-[#112189] ml-4 text-[0.8rem] text-right">
                            {typeof sysCpuPct === "number" ? `Usage: ${sysCpuPct.toFixed(3)}%` : "--"}
                          </span>
                        </h2>
                        <ResponsiveContainer width={"100%"} height={150}>
                          <AreaChart data={cpuData}>
                            <defs>
                              <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#38bdf8" stopOpacity={1} />
                                <stop offset="100%" stopColor="#1e40af" stopOpacity={1} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" hide />
                            <YAxis tick={{ fontSize: 11, fill: "#ccc" }} unit="%" domain={[0, 100]} />
                            <Tooltip content={<CpuCustomTooltip />} />
                            <Area
                              type="monotone"
                              dataKey="cpu_pct"
                              stroke="#38bdf8"
                              fillOpacity={1}
                              fill="url(#colorCpu)"
                              isAnimationActive={false}
                              dot={false}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>

                      </div>
                   )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default GeneralMetrics;
