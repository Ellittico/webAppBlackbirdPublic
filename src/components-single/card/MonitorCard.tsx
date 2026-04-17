import { useMemo } from "react";

import { FaPause, FaPlay } from "react-icons/fa";
import { useAppSelector } from "../../store/hooks";
import type { AgentTenant } from "../../types/tenants.type";
import { useIsMobile } from "../../utlis/useIsMobile";

type MonitorCardProps = {
    selected: string | null;
    agent: AgentTenant;
    isMenuOpen:boolean
    onClick?: () => void;
};

export function MonitorCard({ agent, onClick,isMenuOpen,selected }: MonitorCardProps) {
    const isMobile = useIsMobile(1000)
    const isSelected = selected == agent.agent_uuid
    const update = useAppSelector(state => state.remoteAgent.agents.find(remote => remote.agent_id === agent.agent_uuid))
    const origins = useAppSelector((state) => state.performance.origins)
    const latestByOrigin = useAppSelector((state) => state.performance.latestByOrigin)
    const originKey = useMemo(() => {
        const fromOrigins = Object.keys(origins).find(
            (key) => origins[key]?.agent_uuid === agent.agent_uuid
        );
        if (fromOrigins) return fromOrigins;
        return (
            Object.keys(latestByOrigin).find(
                (key) => String(key).split(":").pop() === agent.agent_uuid
            ) ?? null
        );
    }, [origins, latestByOrigin, agent.agent_uuid]);
    const perf = (originKey ? latestByOrigin[originKey] : null) ?? null
    const rttRaw = update?.agent_rtt
    const rtt =
        typeof rttRaw === "number"
            ? rttRaw
            : typeof rttRaw === "string"
                ? Number(rttRaw)
                : NaN
    const rttClass =
        Number.isFinite(rtt)
            ? rtt < 100
                ? "bg-green-500"
                : rtt >= 100 && rtt <= 150
                    ? "bg-yellow-500"
                    : rtt > 150
                        ? "bg-red-500"
                        : "bg-gray-200"
            : "bg-gray-400"
    return(
        <div
            className={` ${isSelected ? "bg-[#35414d]" : "bg-[#3b3b3b]"} ${isMenuOpen && "w-[260px]"} ${isMobile && "w-[92vw] mx-auto"} rounded-sm flex flex-row px-2 justify-between gap-1 py-1 shadow-sm `}
            role="button"
            tabIndex={0}
            onClick={onClick}
            onKeyDown={(event) => {
                if (!onClick) return;
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onClick();
                }
            }}
        >
            {isMenuOpen ? 
            <div className="flex flex-row gap-2 w-full min-w-0 ">
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <div className="text-[0.8rem] w-45 font-semibold text-blue-300 truncate text-left flex flex-row items-center gap-2">
                        <span className="truncate w-[120px]">{agent.agent_name}</span>
                    </div>
                    <div className="text-[0.75rem] w-32 text-slate-200 bg-[#2e2e2e] rounded-sm px-2 py-1">
                        <div className="truncate text-left">WAN: {update?.public_ip ?? "N/D"}</div>
                        <div className="truncate text-left">GW: {update?.gateway_ip ?? "N/D"}</div>
                    </div>
                </div>
                <div className="flex flex-col ">
                    <div className={`text-[0.75rem] text-slate-800 px-2 py-0.5 rounded-sm ${rttClass}`}>
                        RTT: {Number.isFinite(rtt) ? rtt : "N/D"} ms
                    </div>
                    <div className="ml-auto flex flex-row bg-[#2e2e2e] gap-2 px-2 h-max rounded-sm">
                        <div className="text-[0.75rem] rounded-sm  py-1 text-slate-200 flex flex-col gap-y-0.5 ">
                            <span className="text-slate-400">CPU</span>
                            <span className="text-right">{perf?.sys_cpu_pct?.toFixed(0) ?? "--"}%</span>
                        </div>
                    <div className="text-[0.75rem] rounded-sm  py-1 text-slate-200 flex flex-col  gap-y-0.5 ">
                            <span className="text-slate-400">RAM</span>
                            <span className="text-right">{( perf?.sys_mem_used_pct?.toFixed(0)) ?? "--"}%</span>
                        </div>
                    <div className="text-[0.75rem] rounded-sm  py-1 text-slate-200 flex flex-col  gap-y-0.5 ">
                            <span className="text-slate-400">DISC</span>
                            <span className="text-right">{( perf?.sys_disk_used_pct?.toFixed(0)) ?? "--"}%</span>
                        </div>
                    </div>
                </div>
            </div>
            :

            <div className={`flex ${isMobile ? "flex-col w-[95vw]" : "flex-row w-full"}  gap-5 `}>
                {/** UPDATES */}
                <div className={`text-[0.75rem] leading-tight w-full flex flex-col gap-1 flex-1`}>
                    <div className="text-[0.8rem] font-semibold text-blue-300 truncate text-left flex flex-row items-center gap-2">
                        <span className="truncate w-34">{agent.agent_name}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-left">
                        <div className="flex flex-col gap-0.5 min-w-0">
                            <div className="truncate w-31"><span className="text-slate-400">HN</span> {update?.hostname ?? "N/D"}</div>
                            <div className="truncate"><span className="text-slate-400">WAN</span> {update?.public_ip ?? "N/D"}</div>
                            <div className="truncate"><span className="text-slate-400">GW</span> {update?.gateway_ip ?? "N/D"}</div>
                        </div>
                        <div className="flex flex-col gap-0.5 min-w-0">
                            
                            <div className="truncate">
                                <span className="text-slate-400">LU</span>{" "}
                                {update?.last_internal_update
                                    ? new Date(update.last_internal_update).toLocaleString("it-IT", {
                                        year: "numeric",
                                        month: "2-digit",
                                        day: "2-digit",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        second: "2-digit",
                                    })
                                    : "N/D"}
                            </div>
                            <div className="truncate"><span className="text-slate-400">OS</span> {update?.os ?? "N/D"}</div>
                            <div className="truncate"><span className="text-slate-400">ARCH</span> {update?.arch ?? "N/D"}</div>
                        </div>
                    </div>
                    <div className="flex flex-row items-center gap-1 mt-auto">
                        <div className={`inline-block w-max text-[0.7rem] text-slate-800 px-2 py-0.5 rounded-sm ${rttClass}`}>
                            RTT: {Number.isFinite(rtt) ? rtt : "N/D"} ms
                        </div>
                        <span className="text-[0.7rem] text-slate-200 truncate ml-2">
                            <span className="text-gray-400">V: </span>{update?.version ?? "N/D"}
                        </span>
                    </div>

                </div>
                {/** METRICS */}
                <div className={`flex flex-row gap-3 flex-1 `}>
                    <div className={`flex flex-col ${isMobile ? "flex-1" : "w-32"} `}>
                        <p className=" text-[0.8rem] font-semibold text-blue-300 text-left">System:</p>
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
                                        : "--"}GB
                                </span>
                                 /                                 
                                 <span className="text-right">
                                    {typeof perf?.sys_mem_total_mb === "number"
                                        ? (perf.sys_mem_total_mb / 1024).toFixed(1)
                                        : "--"}GB
                                </span> 

                            </div>
                        </div>
                        <div className="flex flex-col">
                            <div className="text-[0.75rem] rounded-sm  text-slate-200 flex flex-row justify-between">
                                <span className="text-slate-400">DISC</span>
                                <span className="text-right">{(perf?.sys_disk_used_pct?.toFixed(0)) ?? "--"}%</span>
                            </div>
                            <div className="text-[0.75rem] rounded-sm  text-slate-200 flex flex-row  gap-2 w-full justify-end">
                                <span className="text-right whitespace-nowrap">
                                    {typeof perf?.sys_disk_used_mb === "number"
                                        ? perf.sys_disk_used_mb >= 1_000_000
                                            ? `${(perf.sys_disk_used_mb / 1_000_000).toFixed(2)} TB`
                                            : perf.sys_disk_used_mb >= 1_000
                                                ? `${(perf.sys_disk_used_mb / 1_000).toFixed(2)} GB`
                                                : `${perf.sys_disk_used_mb.toFixed(0)} MB`
                                        : "--"}
                                </span> /
                                <span className="text-right whitespace-nowrap">
                                    {typeof perf?.sys_disk_total_mb === "number"
                                        ? perf.sys_disk_total_mb >= 1_000_000
                                            ? `${(perf.sys_disk_total_mb / 1_000_000).toFixed(2)} TB`
                                            : perf.sys_disk_total_mb >= 1_000
                                                ? `${(perf.sys_disk_total_mb / 1_000).toFixed(2)} GB`
                                                : `${perf.sys_disk_total_mb.toFixed(0)} MB`
                                        : "--"}
                                </span>
                            </div>
                        </div>               
                    </div>
                    <div className={`flex flex-col  ${isMobile ? "flex-1" : "w-32"} `}>
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
                                <span className="text-slate-400">Threads</span>
                                <span className="text-right">{perf?.bbird_threads ?? "--"}</span>
                            </div>
                                <div className="text-[0.75rem] rounded-sm  text-slate-200 flex flex-row justify-between">
                                    <span className="text-slate-400">I/O Read</span>
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
                                    <span className="text-slate-400">I/O Write</span>
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
                <div className="flex flex-col justify-center flex-2 ">
                    <p className=" text-[0.8rem] font-semibold text-blue-300 text-left">Monitoring General:</p>
                    <div className={`flex ${isMobile ? "my-1" : "flex-row "} flex-wrap items-center gap-3 text-[0.75rem] flex-1 h-max max-h-max`}>
                        <span className="text-slate-200 w-28 shrink-0 truncate">IP totali: --</span>
                        <span className="text-slate-300 w-28 shrink-0 truncate">RTT medio: --</span>
                        <span className="text-slate-300 w-28 shrink-0 truncate">RTT min: --</span>
                        <span className="text-slate-300 w-28 shrink-0 truncate">RTT max: --</span>
                    </div>
                   <div className={`flex ${isMobile ? "flex-col gap-2" : "flex-row"}  mt-auto bg-[#2e2e2e] text-[0.8rem] p-1 rounded-sm px-2`}>
                        <div className={`flex flex-row items-center gap-2  border-r border-[#3a3a3a] ${isMobile ? "justify-between": "ml-auto pr-3"} `}>
                            <span>Logs</span>
                            {update?.base_logs ?
                            <button
                                className="flex flex-row items-center bg-blue-600 gap-2 px-3 rounded-sm h-max py-[0px]">
                                Stop
                                <FaPause size={10}/>
                            </button>
                            :
                            <button
                                className="flex flex-row items-center bg-blue-600 gap-2 px-3 rounded-sm h-max py-[0px]">
                                Start
                                <FaPlay size={10}/>
                            </button>
                            }
                        </div>
                        <div className={`flex flex-row items-center gap-2 ${isMobile ? "justify-between": "px-3"} border-r border-[#3a3a3a]`}>
                            <span>Performance</span>
                            {update?.perf_logs ?
                            <button
                                className="flex flex-row items-center bg-blue-600 gap-2 px-3 rounded-sm h-max py-[0px]">
                                Stop
                                <FaPause size={10}/>
                            </button>
                            :
                            <button
                                className="flex flex-row items-center bg-blue-600 gap-2 px-3 rounded-sm h-max py-[0px]">
                                Start
                                <FaPlay size={10}/>
                            </button>
                            }
                        </div>
                        <div className={`flex flex-row items-center gap-2 ${isMobile ? "justify-between": "pl-3 mr-auto"} `}>
                            <span>Monitoring</span>
                            {update?.monitoring ?
                            <button
                                className="flex flex-row items-center bg-blue-600 gap-2 px-3 rounded-sm h-max py-[0px]">
                                Stop
                                <FaPause size={10}/>
                            </button>
                            :
                            <button
                                className="flex flex-row items-center bg-blue-600 gap-2 px-3 rounded-sm h-max py-[0px]">
                                Start
                                <FaPlay size={10}/>
                            </button>
                            }
                        </div>
                    </div>
                </div>

            </div>
            }

        </div>
    )
}

