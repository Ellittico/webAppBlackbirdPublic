import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FaCheck, FaEllipsisV, FaPlus, FaTimes, FaTrash, FaChevronDown } from 'react-icons/fa';
import { useHomeControls } from '../controls/HomeControl';
import LanguageSelector from '../components-single/resusable/selector/LanguageSelector';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '../utlis/useIsMobile';

const HomeSkeleton: React.FC = () => (
  <div className="animate-pulse">
    <div className="flex flex-col md:flex-row gap-8 h-full mt-6 mx-8 items-stretch">
      <div className="min-h-[50vh] flex-1 bg-[#444444] rounded-lg shadow-md p-2">
        <div className="h-5 w-28 bg-[#3b3b3b] rounded-md mb-3 ml-3" />
        <div className="p-3 h-[45vh] bg-[#2c2c2c] rounded-md flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={`ws-skeleton-${index}`}
              className="bg-[#3b3b3b] rounded-md p-2 flex items-center gap-3"
            >
              <div className="h-9 w-9 bg-[#4b4b4b] rounded-full" />
              <div className="h-4 w-48 bg-[#4b4b4b] rounded-md" />
              <div className="ml-auto h-4 w-24 bg-[#4b4b4b] rounded-md" />
            </div>
          ))}
        </div>
      </div>
      <div className="min-h-[45vh] flex-1 bg-[#444444] rounded-lg shadow-md p-2">
        <div className="h-5 w-36 bg-[#3b3b3b] rounded-md mb-3 ml-3" />
        <div className="p-3 h-[45vh] bg-[#2c2c2c] rounded-md flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={`agent-skeleton-${index}`}
              className="bg-[#3b3b3b] rounded-md p-2 flex items-center gap-3"
            >
              <div className="h-4 w-40 bg-[#4b4b4b] rounded-md" />
              <div className="h-4 w-28 bg-[#4b4b4b] rounded-md" />
              <div className="ml-auto h-4 w-20 bg-[#4b4b4b] rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
    <div className="flex flex-col md:flex-row gap-8 h-full mt-6 mx-8 items-stretch">
      <div className="min-h-[30vh] w-[55vw] bg-[#444444] rounded-lg shadow-md p-2" />
      <div className="min-h-[30vh] flex-1 bg-[#444444] rounded-lg shadow-md p-2" />
    </div>
  </div>
)

const Home: React.FC = () => {
  const {t} = useTranslation()
  const isMobile = useIsMobile(1000)
  const [openAgent, setOpenAgent] = useState<string | null>(null);
  const agentsListRef = useRef<HTMLUListElement | null>(null);
  const handleScrollDown = () => {
    const container = document.querySelector(".mainApp-scroll") as HTMLElement | null
    const delta = window.innerHeight
    if (container) {
      container.scrollBy({ top: delta, behavior: "smooth" })
      return
    }
    window.scrollBy({ top: delta, behavior: "smooth" })
  }
  const {
    handleSelectedTentant,
    info,agents,
    isClosing,
    workspaces,
    handleOpenWork,
    isOpenAddWork,
    handleAddWork,
    inputValWorkName, setinputValWorkName,
    isLoadingHome,
    invites,invitesLoaded,handleRejectInvite,handleAcceptInvite,
  } = useHomeControls()

  useEffect(() => {
    if (!openAgent) return
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (agentsListRef.current?.contains(target)) return
      setOpenAgent(null)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [openAgent])

  const groupedAgents = useMemo(() => {
    const map = new Map<string, typeof agents>()
    agents.forEach((agent) => {
      const existing = map.get(agent.agent_uuid)
      if (existing) {
        existing.push(agent)
      } else {
        map.set(agent.agent_uuid, [agent])
      }
    })

    return Array.from(map.values()).map((items) => ({
      agent_uuid: items[0].agent_uuid,
      items,
    }))
  }, [agents])

  if (isLoadingHome) {
  return (
  <div className=' text-white max-content relative '>
        <HomeSkeleton />
      </div>
    )
  }

  return (
  <div className=' text-white max-content relative flex flex-wrap flex-col overflow-y-auto overflow-x-hidden pb-4' >
      {info && (
        <div
          className={`
            fixed top-12 left-6 z-50
            bg-white text-black rounded-md px-6 py-4 shadow-md
            transition-[opacity,transform] duration-500 ease-in-out
            ${isClosing ? "opacity-0 translate-y-6" : "opacity-100 translate-y-0"}
          `}
        >
          <b>Messagge:</b> {info}
        </div>
      )}
      <div className={`flex flex-row flex-wrap gap-8 h-full mt-6 ${isMobile ? "mx-2" : "px-4 w-[calc(100%-25px)]"}  items-stretch flex-1 `}>
        {/* WORKSPACES */}
        <div className={`bg-[#444444] sm:min-h-[350px] ${isMobile ? "w-[95vw] min-w-auto  min-h-[80vh]" : "w-auto min-w-[580px]  flex-1  min-h-[50vh]"}  rounded-lg shadow-md p-2  overflow-auto `}>
          <div className='flex flex-row items-center relative'>
            <h2 className="  text-[14px] mb-1  fzen  pl-3  text-[#779bff] ">{t("home.workspaces")}</h2>
              {isOpenAddWork 
                  ?        
                <button
                  onClick={()=>{handleOpenWork(false)}}
                  className="absolute -top-0 right-1  flex items-center justify-center gap-2 bg-blue-700
                  outline-none focus:outline-none focus:ring-0 px-2 font-[400] text py-1 rounded-md"
                >
                  <FaTimes size={10}/>
                </button>
                :
                <button
                  onClick={()=>{handleOpenWork(true)}}
                  className="absolute -top-0 right-1  flex items-center justify-center gap-2 bg-blue-700
                  outline-none focus:outline-none focus:ring-0 px-2 font-[400] text py-1 rounded-md"
                >
                  <FaPlus size={10}/>
                </button> 
              }
          </div>
          <ul className={`space-y-1 outline-none focus:outline-none focus:ring-0 p-1 ${isMobile ? "h-[75vh]" : "h-[45vh]"}  overflow-y-auto scrollbar-brand bg-[#2c2c2c] rounded-md `}>
            {isOpenAddWork && 
              
              <div key={"newWork"} className="relative w-full bg-slate-600 rounded-md px-1 py-1">
                <input 
                  name='newWork'
                  value={inputValWorkName}
                  onChange={(e) => setinputValWorkName(e.currentTarget.value)}
                  type="text" 
                  placeholder={t("home.insertName")}
                  className=" bg-[#333333] peer w-full text-white outline-none px-5 py-2 rounded-md fullplaceholder whitePlace text-[0.8rem]" />
                <button className=' absolute right-2  top-[21px] px-3 py-1.5 -translate-y-1/2 opacity-0 rounded-md items-center
                      transition-opacity peer-[&:not(:placeholder-shown)]:opacity-100 bg-[#242424] flex'
                      onClick={handleAddWork}>
                  <FaCheck size={14}
                    className=" text-green-500 "   
                  />
                  </button>
              </div>

              }
            {workspaces.map(ws => {

              return (
              <div key={ws.id} className=" rounded-md overflow-hidden outline-none focus:outline-none focus:ring-0 text-[0.8rem]">
                <button
                  onClick={() =>
                  {handleSelectedTentant(ws.id)}
                  }
                  className={`w-full bg-[#3b3b3b] hover:bg-[#444] outline-none focus:outline-none focus:ring-0 px-3 font-[400] text ${
                    isMobile ? "flex flex-row items-start justify-between gap-1 py-2" : "flex items-center justify-between gap-3 py-1"
                  }`}
                >
                  <div className={`flex items-center gap-3 ${isMobile ? "w-full" : ""}`}>
                    <span className='h-9 w-9 min-w-9 bg-slate-500 rounded-full flex items-center justify-center font-semibold text-[0.8rem]'>
                      {ws.name.at(0)?.toUpperCase()}
                    </span>
                    <span className={`text-[0.8rem] truncate text-left ${isMobile ? "max-w-[70%] mb-2" : "w-[200px]"}`}>
                      {ws.name.charAt(0).toUpperCase() + ws.name.slice(1)}
                    </span>
                  </div>

                  <div className={`flex items-center gap-3 ${isMobile ? "justify-between" : ""}`}>
                    {/*<span className={`text-[0.80rem] flex  leading-[20px] justify-center ${isMobile ? "text-left  flex-row gap-1 " : "text-center ml-3 flex-col"} ${isMobile ? "" : "min-w-[95px]"}`}>
                        <span>{t("home.createdOn")}</span>
                        <span className="text-gray-400">
                            12/12/24 12:12
                        </span>
                    </span>

                    {!isMobile && (
                      <span className="text-[0.80rem] flex flex-row items-center gap-3 leading-[20px] justify-center text-center ml-3 bg-transparent border border-blue-600 text-white px-3 p-1 rounded-md ">
                          <FaCrown/> Owner
                      </span>
                  )}*/}

                    {ws.is_personal ? 
                      <span className={`text-[0.80rem] flex flex-col leading-[20px] justify-center text-center font-semibold bg-blue-200 text-blue-800 px-3 p-1 rounded-md ${isMobile ? "" : "ml-auto"}`}>
                          Private
                      </span>
                          :
                      <span className={`text-[0.80rem] flex flex-col leading-[20px] justify-center text-center font-semibold bg-blue-600 text-white px-3 p-1 rounded-md ${isMobile ? "" : "ml-auto"}`}>
                          Shared
                      </span>
                    }
                  </div>
                </button>
              </div>
              );
            })}
          </ul>
        </div>

        {/* AGENTS */}
        <div className={`   bg-[#444444] sm:min-h-[350px] ${isMobile ? "w-[95vw] min-h-[80vh]" : "min-w-[580px]  flex-1 min-h-[45vh]"} rounded-lg shadow-md p-2  overflow-auto `}>
          <h2 className="  text-[14px] mb-1  pl-3 fzen text-[#779bff]">{t("home.personalAgents")}</h2>
          <ul
            ref={agentsListRef}
            className={`space-y-1 outline-none focus:outline-none focus:ring-0 
            p-1 ${isMobile ? "h-[75vh]" : "h-[45vh]"} overflow-y-auto scrollbar-brand bg-[#2c2c2c] rounded-md`}
          >
            {groupedAgents.map(group => {
              const agent = group.items[0]
              const isExpanded = openAgent === agent.agent_uuid
              const hasDuplicates = group.items.length > 1
              const isOnline = group.items.some((item) => item.online)

            return (
              <div
                key={agent.agent_uuid}
                className="bg-[#3b3b3b] p-1 flex flex-col rounded-md gap-1 text-[0.8rem]"
              >
                <button
                  type="button"
                  onClick={() => {
                    if (!hasDuplicates) return
                    setOpenAgent(isExpanded ? null : agent.agent_uuid)
                  }}
                  className={`w-full outline-none focus:outline-none focus:ring-0 px-2 ${
                    isMobile ? "flex items-center gap-2 py-2" : "flex flex-row items-center gap-1 py-1"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isOnline ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                  <div className="capitalize flex-1 truncate text-left">
                    {agent.agent_display_name}
                  </div>
                  {hasDuplicates ? (
                    <span className="ml-2 text-gray-300 hover:text-white px-1">
                      <FaEllipsisV size={12} />
                    </span>
                  ) : (
                    <div className="w-[28px]" />
                  )}
                </button>

                {isExpanded && isMobile && (
                  <div className="mt-2 rounded-md bg-[#2f2f2f] p-2 text-[0.75rem]">
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-row items-center justify-between gap-3 px-2">
                        <span className="text-gray-400">{t("home.lastAccess")}</span>
                        <span className="truncate text-gray-200">
                          {agent.last_seen_at
                            ? new Date(agent.last_seen_at).toLocaleString("it-IT", {
                                dateStyle: "short",
                                timeStyle: "short",
                              })
                            : t("home.notAvailable")}
                        </span>
                      </div>
                      {hasDuplicates && (
                        <div className="mt-2 flex flex-col gap-1">
                          <p className='text-[#779bff] font-semibold'> {t("home.agentNames")}</p>
                          {group.items.map((item) => (
                            <div
                              key={`${item.agent_uuid}-${item.tenant_uuid}`}
                              className="flex flex-row items-center justify-between gap-3 px-2"
                            >
                              <span className="truncate capitalize">{item.agent_display_name}</span>
                              <span className="truncate text-gray-400">{item.tenant_display_name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {isExpanded && !isMobile && hasDuplicates && (
                  <div className="mt-2 rounded-md bg-[#2f2f2f] p-2 text-[0.75rem]">
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-row items-center justify-between gap-3 px-2">
                        <span className="text-gray-400">{t("home.lastAccess")}</span>
                        <span className="truncate text-gray-200">
                          {agent.last_seen_at
                            ? new Date(agent.last_seen_at).toLocaleString("it-IT", {
                                dateStyle: "short",
                                timeStyle: "short",
                              })
                            : t("home.notAvailable")}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-col gap-1">
                        <p className='text-[#779bff] font-semibold'> {t("home.agentNames")}</p>
                        {group.items.map((item) => (
                          <div
                            key={`${item.agent_uuid}-${item.tenant_uuid}`}
                            className="flex flex-row items-center justify-between gap-3 px-2"
                          >
                            <span className="truncate capitalize">{item.agent_display_name}</span>
                            <span className="truncate text-gray-400">{item.tenant_display_name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
          </ul>
        </div>
      </div>
   
      <div className={`flex flex-row flex-wrap-reverse gap-8 h-full mt-6 ${isMobile ? "mx-2" : "px-4 w-[calc(100%-25px)]"} items-stretch flex-1`}>
        {/*Notifiche*/}
        <div className={`   ${isMobile ? "w-[95vw] min-h-[60vh]" : "min-w-[580px]  flex-1  min-h-[35vh]"}  sm:min-h-[350px] bg-[#444444] rounded-lg shadow-md p-2 overflow-auto flex flex-col`}>
          <h2 className="  text-[14px] mb-1 pl-3 fzen text-[#779bff]">{t("home.invites")}</h2>
          <div className="space-y-1 outline-none focus:outline-none focus:ring-0 flex-1 min-h-0 
            overflow-y-auto scrollbar-brand bg-[#2c2c2c] rounded-md">
            {invites.length > 0 ? (
              invites.map((invite) => (
                <div key={invite.invite_token} className="p-1">
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-[#343434] border border-[#424242] rounded-md px-3 py-2">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={()=>handleRejectInvite(invite.invite_token)}
                          className="px-2.5 py-2 bg-[#1f1f1f] hover:bg-[#242424] border border-[#2f2f2f] rounded-md transition-colors">
                          <FaTrash color="#9ca3af" />
                        </button>
                        <div className="flex flex-col">
                          <span className="text-gray-100 text-sm capitalize">{t("home.role")} {invite.role_name}</span>
                          <span className="text-[0.7rem] text-gray-400">
                            {t("home.sentIn")} <span className="text-gray-200">{invite.tenant_name}</span>
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-4 mt-2 md:mt-0">
                        <div className="text-[0.75rem] text-gray-400">
                            {t("home.invitedAt")}{" "}
                          <span className="text-gray-200">
                            {new Date(invite.invited_at).toLocaleString("it-IT", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })}
                          </span>
                        </div>
                        <button 
                          onClick={()=>handleAcceptInvite(invite.invite_token)}
                          className="px-3 py-1.5 text-sm bg-[#618DEB] hover:bg-[#4f7fe6] text-white rounded-md transition-colors">
                          {t("home.accept")}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : invitesLoaded ? (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
               {t("home.noInvites")}
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                 {t("home.loadingInvites")}
              </div>
            )}
           </div>
        </div>
        <div className={`  ${isMobile ? "w-[95vw]  h-[60vh]" : "min-w-[580px]  flex-1  h-[35vh]"} sm:min-h-[350px]  flex-1 bg-[#444444] rounded-lg shadow-md p-2 flex flex-col `}>
          <h2 className="text-left fzen text-[#618DEB] mx-4"> {t("home.language")}</h2>
           <div className="space-y-1 outline-none focus:outline-none focus:ring-0 flex-1 min-h-0
            overflow-y-auto scrollbar-brand bg-[#2c2c2c] rounded-md">
          <LanguageSelector/>
          </div>
        </div>
      </div>
    {isMobile && (
      <button
        type="button"
        onClick={handleScrollDown}
        className="fixed bottom-4 right-4 h-10 w-10 rounded-full bg-blue-600 text-white shadow-md flex items-center justify-center p-0"
        aria-label="Scorri in basso"
      >
        <FaChevronDown size={16} />
      </button>
    )}
  </div>)
};

export default Home;
