import { FaPause, FaPlay, FaTimes } from "react-icons/fa"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { useAppSelector } from "../store/hooks"
import { sendMessage } from "../ws/tenantSocket"
import { startPerfMessage, stopPerfMessage } from "../ws/message/performance/perf.message"
import { startLogMessage, stopLogMessage } from "../ws/message/log/log.message"
import { MonitorCard } from "../components-single/card/MonitorCard"
import type { WsOrigin } from "../types/ws.types"
import { useSelector } from "react-redux"
import type { RootState } from "../store"
import { useIsMobile } from "../utlis/useIsMobile"
import { useTranslation } from "react-i18next"

export function Monitoraggio() {
    //mobile
    const isStrict = useIsMobile(1200)
    const isMobile = useIsMobile(1000)
    //agents
    const tenantId = useSelector((state: RootState) => state.tenant.info?.tenant_id);
    const thisAgentUuid = useSelector((state: RootState) => state.tenant.thisAgentUuid);
    const userId = useSelector((state: RootState) => state.auth.userId);

    const agentOnline = useAppSelector(state => state.tenant.agents.filter(agent => agent.online))
    const [isMenuOpen,setIsMenuOpen] = useState<boolean>(false)
    const [agentSelected,setAgentSelected] = useState<string|null>(null)
    const [lanRowOpen, setLanRowOpen] = useState<boolean>(false)
    const lanRowRef = useRef<HTMLDivElement | null>(null)
    const origin = useMemo<WsOrigin | null>(() => {
            if (!thisAgentUuid || !userId || !tenantId) return null;
            return {
                agent_uuid: thisAgentUuid,
                user_uuid: userId,
                tenant_uuid: tenantId,
                source: "ui",
            };
        }, [thisAgentUuid, userId, tenantId]);
    const agentOptions = useMemo(
        () =>
            (agentOnline ?? []).map((agent) => ({
                label: agent.agent_name,
                value: agent.agent_uuid,
            })),
        [agentOnline]
    )
    //updates
    const update = useAppSelector(state => agentSelected ? state.remoteAgent.agents.find(remote => remote.agent_id === agentSelected ) : null )

    //performance
    const latestByOrigin = useAppSelector((state) => state.performance.latestByOrigin)
    const origins = useAppSelector((state) => state.performance.origins)
    const logLinesByOrigin = useAppSelector((state) => state.log.linesByOrigin)
    const logOrigins = useAppSelector((state) => state.log.origins)
    const originKey = useMemo(() => {
        const fromOrigins = Object.keys(origins).find(
            (key) => origins[key]?.agent_uuid === agentSelected
        );
        if (fromOrigins) return fromOrigins;
        return (
            Object.keys(latestByOrigin).find(
                (key) => String(key).split(":").pop() === agentSelected
            ) ?? null
        );
    }, [origins, latestByOrigin, agentSelected]);
    const perf = (originKey ? latestByOrigin[originKey] : null) ?? null
    const logOriginKey = useMemo(() => {
        if (!agentSelected) return null
        const fromOrigins = Object.keys(logOrigins).find(
            (key) => logOrigins[key]?.agent_uuid === agentSelected
        )
        if (fromOrigins) return fromOrigins
        return (
            Object.keys(logLinesByOrigin).find(
                (key) => String(key).split(":").pop() === agentSelected
            ) ?? null
        )
    }, [logOrigins, logLinesByOrigin, agentSelected])
    const selectedLogLines = logOriginKey ? (logLinesByOrigin[logOriginKey] ?? []) : []

    const parseLogTimestamp = useCallback((line?: string) => {
        if (!line) return null
        const match = line.match(/\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\]/)
        if (!match) return null
        const d = new Date(match[1].replace(" ", "T"))
        return Number.isNaN(d.getTime()) ? null : d
    }, [])
    const perfTimestamp = useMemo(() => {
        if (!perf?.timestamp) return "N/D"
        const ts = Date.parse(perf.timestamp)
        if (!Number.isFinite(ts)) return "--"
        return new Date(ts).toLocaleString("it-IT", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        })
    }, [perf?.timestamp])
    const lastInternalUpdate = useMemo(() => {
        if (!update?.last_internal_update) return "N/D"
        const ts = Date.parse(update.last_internal_update)
        if (!Number.isFinite(ts)) return "--"
        return new Date(ts).toLocaleString("it-IT", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        })
    }, [update?.last_internal_update])
    const latestLogTimestamp = useMemo(() => {
        if (selectedLogLines.length === 0) return null
        const lastLine = selectedLogLines[selectedLogLines.length - 1]
        const ts = parseLogTimestamp(lastLine)
        return ts ? ts.getTime() : null
    }, [selectedLogLines, parseLogTimestamp])
    const latestLogLabel = useMemo(() => {
        if (!latestLogTimestamp) return "N/D"
        return new Date(latestLogTimestamp).toLocaleString("it-IT", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        })
    }, [latestLogTimestamp])
    const displayLogLines = useMemo(() => {
        return selectedLogLines
            .map((line, idx) => {
                const ts = parseLogTimestamp(line)
                return {
                    line,
                    idx,
                    ts: ts ? ts.getTime() : null,
                }
            })
            .sort((a, b) => {
                if (a.ts !== null && b.ts !== null) {
                    if (a.ts !== b.ts) return a.ts - b.ts
                    return a.idx - b.idx
                }
                if (a.ts === null && b.ts === null) return a.idx - b.idx
                return a.idx - b.idx
            })
            .map((item) => item.line)
            .slice(-4)
    }, [selectedLogLines, parseLogTimestamp])
    const getLogColorClass = useCallback((line: string) => {
        if (line.includes("[TRACE]")) {
            return "text-gray-400 text-left text-[0.75rem]"
        }
        if (line.includes("[DEBUG]")) {
            return "text-cyan-400 text-left text-[0.75rem]"
        }
        if (line.includes("[INFO]")) {
            return "text-blue-400 text-left text-[0.75rem]"
        }
        if (line.includes("[NOTICE]")) {
            return "text-purple-400 text-left text-[0.75rem]"
        }
        if (line.includes("[WARN] ")) {
            return "text-yellow-400 text-left text-[0.75rem]"
        }
        if (line.includes("[ERROR]")) {
            return "text-red-500 text-left text-[0.75rem]"
        }
        if (line.includes("[FATAL] ")) {
            return "text-red-700 font-bold text-left text-[0.75rem]"
        }
        if (line.includes("[SUCCESS] ")) {
            return "text-green-400 font-bold text-left text-[0.75rem]"
        }
        return "text-slate-200 text-left text-[0.75rem]"
    }, [])

    const handleSetAgent = (agent_uuid:string) => {
        setIsMenuOpen(true);
        setAgentSelected(agent_uuid)
    }
    const handleSelectAgent = (value: string) => {
        if (!value) {
            setIsMenuOpen(false)
            setAgentSelected(null)
            return
        }
        setIsMenuOpen(true)
        setAgentSelected(value)
    }

    const handleStartPerformance = () =>{
        if(!agentSelected|| !origin) return
        sendMessage(startPerfMessage(origin, agentSelected ));
    }
    
    const handleStopPerformance = () =>{
        if(!agentSelected|| !origin) return
        sendMessage(stopPerfMessage(origin, agentSelected ));
    }

    const handleStartLog = () =>{
        if(!agentSelected|| !origin) return
        sendMessage(startLogMessage(origin, agentSelected ))
    }

    const handleStopLog = () =>{
        if(!agentSelected|| !origin) return
        sendMessage(stopLogMessage(origin, agentSelected ))
    }
    useEffect(() => {
        if (!lanRowOpen) return
        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            const target = event.target as Node
            if (lanRowRef.current?.contains(target)) return
            setLanRowOpen(false)
        }
        document.addEventListener("mousedown", handleClickOutside)
        document.addEventListener("touchstart", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
            document.removeEventListener("touchstart", handleClickOutside)
        }
    }, [lanRowOpen])
    const { t } = useTranslation()
    return (
        <div className={`bg-[#2e2e2e] h-full flex ${isStrict ? "flex-col" : "flex-row"} p-2 gap-1 text-gray-200`}>

            <div className={`flex flex-col bg-[#3b3b3b] p-1 gap-1 rounded-sm max-h-[calc(100vh-97px)] ${isStrict && "mx-auto"} ${isMenuOpen ? "min-w-[276px] max-w-[276px]" : "flex-1" }`}>
                <span className="flex flex-row bg-[#2e2e2e] gap-3 p-1 text-gray-200  items-center px-2 rounded-sm">                
                    <p className="text-[0.8rem]"> {t("monitor.onlineAgents")}</p>
                    {isMenuOpen && 
                        <button
                            onClick={()=>{setIsMenuOpen(false);setAgentSelected(null)}}
                            className="p-0.5 bg-blue-600 text-[0.8rem] flex flex-row items-center gap-2 px-1.5 rounded-sm ml-auto py-[0px]"
                            > 
                                {t("monitor.deselect")}
                                <FaTimes size={14}/>
                        </button>
                    }
                </span>
                {isStrict && isMenuOpen ?
                <div className="px-1">
                   <select
                        className="w-full bg-[#2b2b2b] text-gray-200 text-[0.8rem] px-3 py-1.5 rounded-md border border-[#3a3a3a]
                          focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] hover:border-[#3b82f6]
                          transition-colors cursor-pointer disabled:bg-[#474747]"
                        value={agentSelected ?? ""}
                        onChange={(e) => handleSelectAgent(e.target.value)}
                        disabled={agentOptions.length === 0}
                    >
                        <option value="" disabled>
                            {t("monitor.selectAgent")}
                        </option>
                        {agentOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>  
                </div>
                :
                <div className="bg-[#2e2e2e] max-h-[calc(100vh-140px)] h-full overflow-y-auto rounded-sm p-1 flex flex-col gap-1 mainApp-scroll">
                    {agentOnline.length === 0 ? (
                        <div className="bg-gradient-to-b from-[#00000000] flex-1 flex justify-center items-center to-[#040a16] w-full">
                       <span>{t("monitor.noAgentsAvailable")}</span>
                        </div>
                    ) : (
                        agentOnline.map((t) => (
                            <MonitorCard
                                key={t.agent_uuid}
                                selected = {agentSelected} 
                                agent={t}
                                isMenuOpen={isMenuOpen}
                                onClick={() => handleSetAgent(t.agent_uuid)}
                            />
                            
                        ))
                        
                    )}

                </div>
                 } 
            </div>
            {isMenuOpen && agentSelected &&
                <div className={`flex ${isMobile ? "" : ""} flex-col flex-1 bg-[#3b3b3b] ${isMobile && "w-[96vw]"} rounded-sm gap-1 p-1 overflow-auto max-h-[calc(100vh-97px)] mainApp-scroll`} >
                    <div className={`flex ${isMobile ? "flex-col" : "flex-row"}  gap-1 min-h-50`}>
                         {/** UPDATES */}
                        <div className="bg-[#2e2e2e] flex-1">
                            <span className="text-[0.75rem] flex flex-row gap-4 px-4 p-0.5 pb-[4px] bg-[#3a3a3a] font-semibold justify-between truncate">
                                {t("monitor.agentUpdate")} - {lastInternalUpdate}  <span className="w-30 truncate"> -  {agentOnline.find(a => a.agent_uuid === thisAgentUuid)?.agent_name}</span>
                            </span>
                            <div className="p-2 max-h-44 overflow-y-auto mainApp-scroll text-[0.75rem]  text-slate-200 grid grid-cols-2 gap-x-4 gap-y-1">
                                <div className="flex flex-row justify-between"><span className="text-slate-400">HN:</span> {update?.hostname ?? "N/D"}</div>
                                <div className="flex flex-row justify-between"><span className="text-slate-400">OS:</span> {update?.os ?? "N/D"}</div>
                                <div className="flex flex-row justify-between"><span className="text-slate-400">Arch:</span> {update?.arch ?? "N/D"}</div>
                                <div className="flex flex-row justify-between"><span className="text-slate-400">Go V:</span> {update?.go_version ?? "N/D"}</div>
                                <div className="flex flex-row justify-between"><span className="text-slate-400">WAN:</span> {update?.public_ip ?? "N/D"}</div>
                                <div className="flex flex-row justify-between"><span className="text-slate-400">GW IP:</span> {update?.gateway_ip ?? "N/D"}</div>
                                <div className="flex flex-row justify-between"><span className="text-slate-400 ">RTT</span> {update?.agent_rtt ?? "N/D"} ms</div>
                            
                                <div className="flex flex-row justify-between truncate gap-1"><span className="text-slate-400">V:</span> {update?.version ?? "N/D"}</div>
                                <div className="col-span-2">
                                    <p className="text-slate-400 text-left w-full">{t("monitor.networkInterfaces")}:</p>
                                    <div className="mt-1 flex flex-col gap-1">
                                        {update?.network_interfaces?.length
                                            ? update.network_interfaces.map((ni) => (
                                                <div
                                                    key={`${ni.iface}-${ni.mac}`}
                                                    className="flex flex-row flex-wrap gap-x-3 gap-y-1 rounded-sm bg-[#1f1f1f]/40 px-2 py-1"
                                                >
                                                    <span className="text-slate-300">
                                                        <span className="text-slate-400">IF</span> {ni.iface}
                                                    </span>
                                                    <span className="text-slate-300">
                                                        <span className="text-slate-400">IP</span> {ni.ip}
                                                    </span>
                                                    <span className="text-slate-300">
                                                        <span className="text-slate-400">MAC</span> {ni.mac}
                                                    </span>
                                                    <span className="text-slate-300">
                                                        <span className="text-slate-400">SN</span> {ni.subnet}
                                                    </span>
                                                </div>
                                            ))
                                            : <span className="text-slate-300">N/D</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/** PERFORMANCE */}
                        <div className="bg-[#2e2e2e] flex-1 flex-col ">
                            <span className="text-[0.75rem] flex flex-row gap-4 px-4 p-0.5 bg-[#3a3a3a] font-semibold justify-between">

                                {t("monitor.performances")} - {perfTimestamp}
                                {update?.perf_logs ?
                                <button
                                    onClick={()=>{handleStopPerformance()}} 
                                    className="flex flex-row items-center bg-blue-600 gap-2 px-3 rounded-sm ml-auto py-[0px]">
                                   {t("monitor.stop")}
                                    <FaPause size={10}/>
                                </button>
                                :
                                <button
                                    onClick={()=>{handleStartPerformance()}} 
                                    className="flex flex-row items-center bg-blue-600 gap-2 px-3 rounded-sm ml-auto py-[0px]">
                                    {t("monitor.start")}
                                    <FaPlay size={10}/>
                                </button>
                                }


                            </span>
                            <div className="flex flex-row gap-3 px-2">
                                <div className="flex flex-col min-w-32 flex-1 rounded-sm ">
                                    <p className=" text-[0.8rem] font-semibold text-blue-300 text-left">{t("monitor.system")}:</p>
                                    <div className="text-[0.75rem] rounded-sm  text-slate-200 flex flex-row justify-between">
                                        <span className="text-slate-400">CPU</span>
                                        <span className="text-right">{(perf?.sys_cpu_pct?.toFixed(0)) ?? "--"}%</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="text-[0.75rem] rounded-sm  text-slate-200 flex flex-row justify-between">
                                            <span className="text-slate-400">RAM</span>
                                            <span className="text-right">{(perf?.sys_mem_used_pct?.toFixed(0)) ?? "--"}%</span>
                                        </div>
                                        <div className="text-[0.75rem] rounded-sm  text-slate-200 flex flex-row gap-1  w-full justify-end">
                                            <span className="text-right whitespace-nowrap">
                                                {typeof perf?.sys_mem_used_mb === "number"
                                                    ? (perf.sys_mem_used_mb / 1024).toFixed(1)
                                                    : "-- "}GB
                                            </span>
                                            /                                 
                                            <span className="text-right">
                                                {typeof perf?.sys_mem_total_mb === "number"
                                                    ? (perf.sys_mem_total_mb / 1024).toFixed(1)
                                                    : "-- "}GB
                                            </span> 

                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="text-[0.75rem] rounded-sm  text-slate-200 flex flex-row justify-between">
                                            <span className="text-slate-400">{t("monitor.disk")}</span>
                                            <span className="text-right">{(perf?.sys_disk_used_pct?.toFixed(0)) ?? "--"}%</span>
                                        </div>

                                        <div className="text-[0.75rem] rounded-sm  text-slate-200 flex flex-row justify-end gap-2">
                                            <span className="text-right whitespace-nowrap">
                                                {typeof perf?.sys_disk_used_mb === "number"
                                                    ? perf.sys_disk_used_mb >= 1_000_000
                                                        ? `${(perf.sys_disk_used_mb / 1_000_000).toFixed(2)} TB`
                                                        : perf.sys_disk_used_mb >= 1_000
                                                            ? `${(perf.sys_disk_used_mb / 1_000).toFixed(2)} GB`
                                                            : `${perf.sys_disk_used_mb.toFixed(0)} MB`
                                                    : "-- GB"}
                                            </span> /
                                            <span className="text-right whitespace-nowrap">
                                                {typeof perf?.sys_disk_total_mb === "number"
                                                    ? perf.sys_disk_total_mb >= 1_000_000
                                                        ? `${(perf.sys_disk_total_mb / 1_000_000).toFixed(2)} TB`
                                                        : perf.sys_disk_total_mb >= 1_000
                                                            ? `${(perf.sys_disk_total_mb / 1_000).toFixed(2)} GB`
                                                            : `${perf.sys_disk_total_mb.toFixed(0)} MB`
                                                    : "-- GB"}
                                            </span>
                                        </div>
                                        <div className="mt-1 max-h-[60px]  overflow-y-auto rounded-sm bg-[#1f1f1f]/40 p-1 mainApp-scroll">
                                            {perf?.sys_disk_volumes
                                                ? Object.entries(perf.sys_disk_volumes).map(([volume, info]) => (
                                                    <div
                                                        key={volume}
                                                        className="text-[0.7rem] text-slate-200 flex flex-row gap-2 items-center px-1 py-0.5"
                                                    >
                                                        <span className="font-semibold text-slate-300">{volume}</span>
                                                        <span className="text-blue-300 ml-auto">{info.UsedPercent.toFixed(1)}%</span>
                                                    </div>
                                                ))
                                                : (
                                                    <div className="text-[0.7rem] text-slate-400 px-1 py-0.5">--</div>
                                                )}
                                        </div>
                                    </div>               
                                </div>
                                <div className="flex flex-col  min-w-32 flex-1  w-32">
                                    <p className=" text-[0.8rem] font-semibold text-blue-300 text-left">Blackbird:</p>
                                    <div className="text-[0.75rem] rounded-sm  text-slate-200 flex flex-row justify-between">
                                        <span className="text-slate-400">CPU</span>
                                        <span className="text-right">{(perf?.bbird_cpu_pct?.toFixed(0)) ?? "--"}%</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="text-[0.75rem] rounded-sm  text-slate-200 flex flex-row gap-1  w-full justify-end">
                                            <span className="text-slate-400 mr-auto">RAM</span>
                                            <span className="text-right whitespace-nowrap">
                                            {typeof perf?.bbird_sys_mb === "number"
                                                ? perf.bbird_sys_mb >= 1_000_000
                                                ? `${(perf.bbird_sys_mb / 1_000_000).toFixed(2)} TB`
                                                : perf.bbird_sys_mb >= 1_000
                                                    ? `${(perf.bbird_sys_mb / 1_000).toFixed(2)} GB`
                                                    : `${perf.bbird_sys_mb.toFixed(0)} MB`
                                                : "--"}
                                            </span>

                                                /                                 
                                                <span className="text-right">
                                                {typeof perf?.sys_mem_total_mb === "number"
                                                    ? (perf.sys_mem_total_mb / 1024).toFixed(1)
                                                    : "--"}GB
                                            </span> 
                                        </div>
                                        <div className="text-[0.75rem] rounded-sm  text-slate-200 flex flex-row justify-between">
                                            <span className="text-slate-400">{t("monitor.threads")}</span>
                                            <span className="text-right">{perf?.bbird_threads ?? "--"}</span>
                                        </div>
                                        <div className="text-[0.75rem] rounded-sm  text-slate-200 flex flex-row justify-between">
                                            <span className="text-slate-400">{t("monitor.gcCycles")}</span>
                                            <span className="text-right">{perf?.bbird_gc_cycles ?? "--"}</span>
                                        </div>
                                        <div className="text-[0.75rem] rounded-sm  text-slate-200 flex flex-row justify-between">
                                            <span className="text-slate-400">{t("monitor.gcPause")}</span>
                                            <span className="text-right">{perf?.bbird_gc_total_pause_ms ?? "-- "} ms</span>
                                        </div>
                                        <div className="text-[0.75rem] rounded-sm  text-slate-200 flex flex-row justify-between">
                                            <span className="text-slate-400">{t("monitor.lastPause")}</span>
                                            <span className="text-right">{perf?.bbird_gc_last_pause_ms ?? "-- "} ms</span>
                                        </div>
                                            <div className="text-[0.75rem] rounded-sm  text-slate-200 flex flex-row justify-between">
                                                <span className="text-slate-400">{t("monitor.ioRead")}</span>
                                                <span className="text-right whitespace-nowrap">
                                                    {typeof perf?.bbird_read_bytes === "number"
                                                        ? perf.bbird_read_bytes >= 1_000_000_000
                                                            ? `${(perf.bbird_read_bytes / 1_000_000_000).toFixed(2)} GB`
                                                            : perf.bbird_read_bytes >= 1_000_000
                                                                ? `${(perf.bbird_read_bytes / 1_000_000).toFixed(2)} MB`
                                                                : perf.bbird_read_bytes >= 1_000
                                                                    ? `${(perf.bbird_read_bytes / 1_000).toFixed(2)} kB`
                                                                    : `${perf.bbird_read_bytes.toFixed(0)} B`
                                                        : "--"}
                                                </span>
                                            </div>
                                            <div className="text-[0.75rem] rounded-sm  text-slate-200 flex flex-row justify-between">
                                                <span className="text-slate-400">{t("monitor.ioWrite")}</span>
                                                <span className="text-right whitespace-nowrap">
                                                    {typeof perf?.bbird_write_bytes === "number"
                                                        ? perf.bbird_write_bytes >= 1_000_000_000
                                                            ? `${(perf.bbird_write_bytes / 1_000_000_000).toFixed(2)} GB`
                                                            : perf.bbird_write_bytes >= 1_000_000
                                                                ? `${(perf.bbird_write_bytes / 1_000_000).toFixed(2)} MB`
                                                                : perf.bbird_write_bytes >= 1_000
                                                                    ? `${(perf.bbird_write_bytes / 1_000).toFixed(2)} kB`
                                                                    : `${perf.bbird_write_bytes.toFixed(0)} B`
                                                        : "--"}
                                                </span>
                                            </div>
                                        </div>
                                </div>
                            </div>

                        </div>
                    </div>
                     {/** LOGS */}
                    <div className={`bg-[#2e2e2e] min-h-40 flex flex-col`}>
                        <span className="text-[0.75rem] flex flex-row gap-4 px-4 p-0.5 bg-[#3a3a3a] font-semibold justify-between">
                            {t("monitor.logs")} - {latestLogLabel}
                            {update?.base_logs ?
                            <button
                                onClick={()=>{handleStopLog()}} 
                                className="flex flex-row items-center bg-blue-600 gap-2 px-3 rounded-sm ml-auto py-[0px]">
                                {t("monitor.stop")}
                                <FaPause size={10}/>
                            </button>
                            :
                            <button
                                onClick={()=>{handleStartLog()}} 
                                className="flex flex-row items-center bg-blue-600 gap-2 px-3 rounded-sm ml-auto py-[0px]">
                                {t("monitor.start")}
                                <FaPlay size={10}/>
                            </button>
                            }
                        </span>
                        <div className="p-2 max-h-64 flex-1 overflow-y-auto mainApp-scroll font-mono bg-[#1e1e1e] flex flex-col gap-1">
                            {displayLogLines.length === 0 ? (
                                <div className="text-[0.75rem] text-slate-400 rounded-sm">{t("monitor.noWarningsOrErrors")}</div>
                            ) : (
                                displayLogLines.map((line, idx) => (
                                    <div key={`${logOriginKey ?? "log"}-${idx}`} className={`rounded-sm whitespace-pre-wrap ${getLogColorClass(line)}`}>
                                        {line}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                    <div className=" bg-[#2e2e2e] min-h-[calc(100vh-110px)] max-h-[calc(100vh-110px)] overflow-auto mainApp-scroll flex flex-col">
                        <span className="text-[0.75rem] flex flex-row gap-4 px-4 p-0.5 bg-[#3a3a3a] font-semibold justify-between">
                            {t("monitor.lanMonitor")}
                            {update?.base_logs ?
                            <button
                                onClick={()=>{handleStopLog()}} 
                                className="flex flex-row items-center bg-blue-600 gap-2 px-3 rounded-sm ml-auto py-[0px]">
                                {t("monitor.stop")}
                                <FaPause size={10}/>
                            </button>
                            :
                            <button
                                onClick={()=>{handleStartLog()}} 
                                className="flex flex-row items-center bg-blue-600 gap-2 px-3 rounded-sm ml-auto py-[0px]">
                                {t("monitor.start")}
                                <FaPlay size={10}/>
                            </button>
                            }
                        </span>
                        <div className="p-1 flex flex-col gap-1" ref={lanRowRef}>
                            <button
                                type="button"
                                onClick={() => setLanRowOpen((v) => !v)}
                                className="w-full text-left p-0"
                            >
                                <div className="flex flex-col gap-2 rounded-sm bg-[#1f1f1f]/40 px-2 py-2 text-[0.75rem]">
                                    <div className="flex flex-row items-center gap-3">
                                        <span className="h-2.5 w-2.5 rounded-full bg-gray-500 shrink-0" />
                                        <div className={`flex ${isMobile ? "flex-row gap-3" : "flex-row items-center gap-2"} min-w-0 flex-1 overflow-hidden`}>
                                            <span className="text-slate-200 font-semibold w-36 shrink-0">IP: --</span>
                                            {isMobile ? (
                                                <span className="text-slate-300 shrink-0">RTT: --</span>
                                            ) : (
                                                <>
                                                    <span className="text-slate-400 truncate max-w-48">HN: --</span>
                                                    <span className="text-slate-400 w-40 shrink-0">MAC: --</span>
                                                    <div className="flex flex-row flex-nowrap gap-1 ml-2 overflow-hidden">
                                                        <span className="rounded-sm bg-[#2a2a2a] px-1.5 py-0.5 text-slate-300 shrink-0">
                                                            TCP 22
                                                        </span>
                                                        <span className="rounded-sm bg-[#2a2a2a] px-1.5 py-0.5 text-slate-300 shrink-0">
                                                            TCP 80
                                                        </span>
                                                        <span className="rounded-sm bg-[#2a2a2a] px-1.5 py-0.5 text-slate-300 shrink-0">
                                                            UDP 53
                                                        </span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        {!isMobile && (
                                            <>
                                                <div className="text-slate-300 w-20 text-right shrink-0">RTT: --</div>
                                                <div className="text-slate-300 w-40 truncate text-right shrink-0">OS: --</div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </button>
                            {lanRowOpen && (
                                <div className="rounded-sm bg-[#1f1f1f]/40 px-3 py-2 text-[0.75rem] text-slate-200 grid grid-cols-2 gap-x-4 gap-y-1">
                                    {isMobile && (
                                        <>
                                            <div className="flex flex-row justify-between"><span className="text-slate-400">HN:</span> --</div>
                                            <div className="flex flex-row justify-between"><span className="text-slate-400">MAC:</span> --</div>
                                            <div className="flex flex-row justify-between"><span className="text-slate-400">OS:</span> --</div>
                                        </>
                                    )}
                                    <div className="flex flex-row justify-between"><span className="text-slate-400">{t("monitor.vendor")}:</span> --</div>
                                    <div className="flex flex-row justify-between"><span className="text-slate-400">TTL:</span> --</div>
                                    <div className="flex flex-row justify-between"><span className="text-slate-400">{t("monitor.reachable")}:</span> --</div>
                                    <div className="flex flex-row justify-between"><span className="text-slate-400">{t("monitor.scanTime")}:</span> --</div>
                                    <div className="col-span-2">
                                        <span className="text-slate-400">{t("monitor.openPorts")}:</span>
                                        <div className="mt-1 grid grid-cols-2 gap-2">
                                            <div className="rounded-sm bg-[#2a2a2a]/60 px-2 py-1">
                                                <div className="text-slate-400 text-[0.7rem]">{t("monitor.tcp")}</div>
                                                <div className="mt-1 flex flex-row flex-wrap gap-1">
                                                    <span className="rounded-sm bg-[#2a2a2a] px-1.5 py-0.5 text-slate-300">22 ssh</span>
                                                    <span className="rounded-sm bg-[#2a2a2a] px-1.5 py-0.5 text-slate-300">80 http</span>
                                                </div>
                                            </div>
                                            <div className="rounded-sm bg-[#2a2a2a]/60 px-2 py-1">
                                                <div className="text-slate-400 text-[0.7rem]">{t("monitor.udp")}</div>
                                                <div className="mt-1 flex flex-row flex-wrap gap-1">
                                                    <span className="rounded-sm bg-[#2a2a2a] px-1.5 py-0.5 text-slate-300">53 dns</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-slate-400">{t("monitor.notes")}:</span> --
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            }
        </div>
    )}
    
