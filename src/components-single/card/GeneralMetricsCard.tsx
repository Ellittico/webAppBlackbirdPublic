import { FaBroadcastTower, FaPlay, FaSquare } from "react-icons/fa";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { sendMessage } from "../../ws/tenantSocket";
import { startPerfMessage, stopPerfMessage } from "../../ws/message/performance/perf.message";
import type { AgentTenant } from "../../types/tenants.type";
import type { RootState } from "../../store";
import type { WsOrigin } from "../../types/ws.types";

type GenerealMetricsCardProps ={
    agent: AgentTenant

    isCurrentAgent:boolean
}
export default function GenerealMetricsCard (
    {agent}:GenerealMetricsCardProps
){

    const isSending = useSelector((state: RootState) => {
        const remoteAgent = state.remoteAgent.agents.find(
            remote => remote.agent_id === agent.agent_uuid || remote.id === agent.agent_uuid
        )
        return Boolean(remoteAgent?.perf_logs)
    })
    
    const tenantId = useSelector((state: RootState) => state.tenant.info?.tenant_id);
    const thisAgentUuid = useSelector((state: RootState) => state.tenant.thisAgentUuid);
    const userId = useSelector((state: RootState) => state.auth.userId);
    const origin = useMemo<WsOrigin | null>(() => {
        if (!thisAgentUuid || !userId || !tenantId) return null;
        return {
            agent_uuid: thisAgentUuid,
            user_uuid: userId,
            tenant_uuid: tenantId,
            source: "ui",
        };
    }, [thisAgentUuid, userId, tenantId]);


    const handleStartingPerf = () => {   
        if (!origin) return;
        const msg = startPerfMessage(origin, agent.agent_uuid)
        sendMessage(msg) 
    }

    const handleStoppingPerf = () =>{
        if (!origin) return;
        sendMessage(stopPerfMessage(origin, agent.agent_uuid))
    }


    return(
    <div key={agent.agent_uuid} className="w-[256px] bg-[#e6efff] dark:bg-[#2e2e2e] py-1 rounded-sm flex flex-row items-center gap-2 px-2">
        {agent.online ? 
            <span className="text-green-500 m-0" style={{ fontSize: '18px' }}>●</span>
            : 
            <span className="text-red-500 m-0" style={{ fontSize: '18px' }}>●</span>
        }
        <span className="max-w-48 truncate text-[#112189] dark:text-white">{agent.agent_name}</span>
        <span className="ml-auto flex flex-row gap-1">
        {agent.online && (
            !isSending ?
            <button
                onClick={()=>{handleStartingPerf()}} 
                className=" p-1 bg-blue-500 rounded-sm text-white"> <FaPlay size={10}/></button>
            :
            <button 
                 onClick={()=>{handleStoppingPerf()}} 
                className=" p-1 bg-blue-500 rounded-sm text-white"><FaSquare size={10}/></button>
            )
        }
        {isSending && 
        <FaBroadcastTower className="tx-icon rounded-sm text-white" size={20}  />
        }</span>
    </div>
    )
}
