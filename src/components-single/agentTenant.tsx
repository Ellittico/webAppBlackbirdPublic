
import React, { useEffect, useMemo, useState } from "react"
import type {AgentTenant } from "../types/tenants.type" 
import type { AgentListUserItem } from "../types/auth.types"
import { updateNameAgentofTenant } from "../api/agent/agent.update-name"
import { removeAgentFromTenantReducer, updateAgentNameReducer } from "../feature/tenants/tenantsSlice"
import { useAppDispatch, useAppSelector } from "../store/hooks"
import { FaTrash } from "react-icons/fa"
import { removeAgentFromTenant } from "../api/tenants/tenant.remove-agent"
import { useTranslation } from "react-i18next"

type Props = {
  agent: AgentListUserItem | AgentTenant
  isEditingAgent: boolean
  isDeletingAgent:boolean
  canDelete:boolean
  isMobile?: boolean
  isExpanded?: boolean
  onToggle?: () => void
  isAgentTenant: (
    agent: AgentListUserItem | AgentTenant
  ) => agent is AgentTenant
}

const AgentTenantItem: React.FC<Props> = ({
  agent,
  isEditingAgent,
  isAgentTenant,
  isDeletingAgent,
  canDelete,
  isMobile,
  isExpanded,
  onToggle
}) => {
  const agentName = useMemo(
    () => isAgentTenant(agent)
      ? agent.agent_name
      : agent.agent_display_name,
    [agent, isAgentTenant]
  )
  const { t } = useTranslation()

  const [name, setName] = useState(agentName)
  const dispatch = useAppDispatch()
  const remoteUpdate = useAppSelector(state => state.remoteAgent.agents.find((remoteAgent)=>agent.agent_uuid === remoteAgent.agent_id ))

  //DEBOUNCE 2S INPUT E CHIAMATA PER UPDATE NOME AGENT
  useEffect(() => {
    if (!isEditingAgent) return

    const trimmedName = name.trim()
    const trimmedOriginal = agentName.trim()

    if (trimmedName === trimmedOriginal || !trimmedName) return

    const timer = setTimeout(async() => {
        try {
          const data = {
            agent_id: agent.agent_uuid,
            display_name: trimmedName,
          }

          const response = await updateNameAgentofTenant(data)
          setName(response.display_name)
          dispatch(updateAgentNameReducer(response))

        } catch (error) {
          console.error("Errore aggiornamento nome agente", error)
        }
    }, 2000)

    return () => clearTimeout(timer)
  }, [name,agentName,isEditingAgent, agent.agent_uuid, dispatch])

  //RICALCOLO NOME AGENT 
  useEffect(() => {
    setName(prev => (prev === agentName ? prev : agentName))
  }, [agentName])

  //INVIO DELETION AGENT
  const handleDeletion = async () =>{
      try {
        const response = await removeAgentFromTenant(agent.agent_uuid)
        if(response.removed === 1){
          dispatch(removeAgentFromTenantReducer(agent.agent_uuid))
        }
        //TO DO AGGIUNGI MESSAGGIO DI RIUSCITA
      } catch (error) {
          console.error("aiuto")
      }
  }


  return (
    <div
      key={agent.agent_uuid}
      className="bg-[#3b3b3b] p-1 flex flex-col rounded-md px-3 gap-2"
    >
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            onToggle?.()
          }
        }}
        className={`w-full outline-none focus:outline-none focus:ring-0 ${
          isMobile ? "flex items-center gap-2 py-2" : "flex flex-row items-center gap-6 py-1"
        }`}
      >
        {/* USER / NAME */}
        {!isEditingAgent ? (
          <div className={`capitalize truncate text-[0.8rem] ${isMobile ? "flex-1 text-left" : "w-[120px]"}`}>
            {isAgentTenant(agent)
              ? agent.agent_name
              : agent.agent_display_name} 
          </div>
        ) : (
          <input
            value={name}
            onChange={(e)=>{setName(e.currentTarget.value)}} 
            name="inputNameAgent"
            className="bg-[#444] rounded-md py-1 px-2 text-[0.8rem]" />
        )}

        {!isMobile && (
          <>

            {/* HOSTNAME */}
            <span className="text-[0.80rem] flex flex-col min-w-[120px] leading-[20px] justify-center text-center ml-1 px-2 rounded-md">
              {t("agents.hostname")}
              <span className="text-gray-400 max-w-[100px] truncate">{remoteUpdate?.hostname ?? "N/D"} </span>
            </span>

            {/* CREATED AT */}
            <span className="text-[0.85rem] flex flex-col leading-[20px] justify-center text-center ml-3">
              {t("agents.createdAt")}
              <span className="text-gray-400">
                {isAgentTenant(agent)
                  ? agent.assigned_at
                    ? new Date(agent.assigned_at).toLocaleString("it-IT", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })
                    :  t("agents.notAvailable")
                  : agent.first_seen_at
                  ? new Date(agent.first_seen_at).toLocaleString("it-IT", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })
                  : t("agents.notAvailable")}
              </span>
            </span>

            {/* IP */}
            <span className="text-[0.85rem] w-[130px] flex flex-col leading-[20px] justify-center text-center ml-3 bg-blue-700 px-3 rounded-md">
              {t("agents.publicIp")}
              <span className="text-gray-200">
                <b>
                  {remoteUpdate?.public_ip && remoteUpdate.public_ip.length > 0
                    ? remoteUpdate.public_ip
                    : "N/D"}
                </b>

              </span>
            </span>

            {/* RTT */}
            <span className="text-[0.85rem] flex flex-col leading-[20px] justify-center text-center ml-3 px-2 rounded-md">
               {t("agents.rtt")}
              <span className="text-green-200">{remoteUpdate?.agent_rtt ?? "N/D"}{remoteUpdate?.agent_rtt && "ms"}</span>
            </span>
          </>
        )}

        {/* STATUS */}
        {isDeletingAgent && canDelete ? (
          <button
            type="button"
            onClick={(e)=>{e.stopPropagation(); handleDeletion()}}
            className="bg-red-500 rounded-md px-2 py-1.5 text-white ml-auto hover:bg-red-400">
            <FaTrash/>
          </button>
        ) : (
          agent.online ? (
            <span className="ml-auto text-[0.85rem] flex flex-col leading-[20px] justify-center text-center px-2 rounded-md bg-green-200 text-green-800">
              {t("agents.online")}
            </span>
          ) : (
            <span className="ml-auto text-[0.85rem] flex flex-col leading-[20px] justify-center text-center px-2 rounded-md bg-red-200 text-red-800">
              {t("agents.offline")}
            </span>
          ) 
        )}
      </div>

      {isMobile && isExpanded && (
        <div className="mt-1 rounded-md bg-[#2f2f2f] p-2 text-[0.8rem]">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-gray-400">{t("agents.hostname")}</span>
              <span className="text-gray-200 truncate">bla bla</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-gray-400"> {t("agents.createdAt")}</span>
              <span className="text-gray-200 truncate">
                {isAgentTenant(agent)
                  ? agent.assigned_at
                    ? new Date(agent.assigned_at).toLocaleString("it-IT", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })
                    : "Non disponibile"
                  : agent.first_seen_at
                  ? new Date(agent.first_seen_at).toLocaleString("it-IT", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })
                  : "Non disponibile"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-gray-400"> {t("agents.publicIp")}</span>
              <span className="text-gray-200">
                <b>12.34.56.78</b>
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-gray-400"> {t("agents.rtt")}</span>
              <span className="text-green-200">34.5ms</span>
            </div>
          </div>
        </div>
      )}
      
    </div>
  )
}

export default AgentTenantItem
