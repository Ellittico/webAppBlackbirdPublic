
import { useNavigate } from "react-router-dom"
import { useTenantControls } from "../controls/TenantControl"
import { FaArrowLeft, FaCheck, FaCrown, FaLock, FaPlus, FaTimes, FaTrash, FaUserPlus, FaUnlock, FaUser, FaCog, FaChevronDown  } from "react-icons/fa"
import AgentTenantItem from "../components-single/agentTenant"
import TenantMemberItem from "../components-single/tenantMember"
import { HiDotsVertical } from "react-icons/hi"
import React, { useEffect, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { useIsMobile } from "../utlis/useIsMobile"


const TenantSkeleton: React.FC = () => (
    <div className="animate-pulse">
        <div className="flex items-center gap-4 mt-1">
            <div className="h-9 w-9 bg-[#2a2a2a] rounded-sm mt-3" />
            <div className="h-6 w-48 bg-[#2a2a2a] rounded-md mt-4" />
            <div className="h-6 w-24 bg-[#2a2a2a] rounded-md mt-3" />
            <div className="h-6 w-6 bg-[#2a2a2a] rounded-md mt-3" />
            <div className="h-6 w-32 bg-[#2a2a2a] rounded-md mt-3" />
        </div>
        <div className="w-full flex flex-row mt-6 ml-4 gap-10">
            <div className="flex flex-col gap-6 w-[450px]">
                <div className="dark:bg-[rgb(59,59,59)] rounded-lg p-3">
                    <div className="flex gap-2">
                        <div className="h-14 w-28 bg-[#2c2c2c] rounded-md" />
                        <div className="h-14 w-56 bg-[#2c2c2c] rounded-md" />
                        <div className="h-14 w-24 bg-[#2c2c2c] rounded-md" />
                    </div>
                    <div className="h-6 w-40 bg-[#2c2c2c] rounded-md mt-4" />
                </div>
                <div className="dark:bg-[#3b3b3b] rounded-lg p-3">
                    <div className="h-6 w-28 bg-[#2c2c2c] rounded-md mb-3" />
                    <div className="bg-[#2c2c2c] rounded-md p-2 flex flex-col gap-2">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <div
                                key={`member-skeleton-${index}`}
                                className="bg-[#3b3b3b] rounded-md p-2 flex items-center gap-3"
                            >
                                <div className="h-10 w-10 bg-[#4b4b4b] rounded-full" />
                                <div className="h-4 w-40 bg-[#4b4b4b] rounded-md" />
                                <div className="ml-auto h-4 w-16 bg-[#4b4b4b] rounded-md" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="w-[60%] h-full dark:bg-[#3b3b3b] rounded-md flex-col flex p-3">
                <div className="flex gap-2 mb-3">
                    <div className="h-8 w-8 bg-[#2c2c2c] rounded-md" />
                    <div className="h-8 w-8 bg-[#2c2c2c] rounded-md" />
                    <div className="h-8 w-8 bg-[#2c2c2c] rounded-md" />
                    <div className="ml-auto h-8 w-24 bg-[#2c2c2c] rounded-md" />
                </div>
                <div className="bg-[#2c2c2c] rounded-md p-2 min-h-[70vh] flex flex-col gap-2">
                    {Array.from({ length: 7 }).map((_, index) => (
                        <div
                            key={`agent-skeleton-${index}`}
                            className="bg-[#3b3b3b] rounded-md p-3 flex items-center gap-3"
                        >
                            <div className="h-10 w-10 bg-[#4b4b4b] rounded-md" />
                            <div className="h-4 w-48 bg-[#4b4b4b] rounded-md" />
                            <div className="ml-auto h-4 w-20 bg-[#4b4b4b] rounded-md" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
)

const Tenant: React.FC = () => {
    const { t } = useTranslation()

    const navigate = useNavigate()
    const{
        isPersonal, nameTenant, members, owner,personalAgentsToAdd,createdAt,updateAt,
        user, myRoleName,
        agentsSeleceted,isAgentTenant,personalAgentIds ,
        handleModifyInfoTenant, isModTenantInfo,setInfoModTenants,
        setTenantName,tenantName,
        openAddMember, isSearchingMember,isOpenMenuModiy,openModifyMenu,
        addMemberRef,modifyTenantRef,
        memberMail,setMemberMail,
        inviteMember,
        openDeleteUser, isDeletingMember, deleteMember,
        isEditingMember, openModifyUser,handleRoleChange,
        infoNotifiche, isClosing,   
        isEditingAgent,openModifyAgentName,
        toggleMenuPersonalAgnet,isPersonalAgents,
        isDeletingAgent,openDeleteAgent,
        IsAddingAgent,openAddAgent,handleAddingAgentOfTenant,
        isLoadingTenantData,handleLeaving,
        
    } = useTenantControls ()
    const [tenantSearchTerm, setTenantSearchTerm] = useState("")
    const [openAgentId, setOpenAgentId] = useState<string | null>(null)
    const agentListRef = useRef<HTMLDivElement | null>(null)
    const isMobile = useIsMobile(1000)
    const tenantNameRef = useRef<HTMLDivElement | null>(null)
    const groupedPersonalAgentsToAdd = useMemo(() => {
        const map = new Map<string, typeof personalAgentsToAdd>()
        personalAgentsToAdd.forEach((agent) => {
            const existing = map.get(agent.agent_uuid)
            if (existing) {
                existing.push(agent)
            } else {
                map.set(agent.agent_uuid, [agent])
            }
        })

        return Array.from(map.values()).map((items) => ({
            agent_uuid: items[0].agent_uuid,
            agent_display_name: items[0].agent_display_name,
            items,
        }))
    }, [personalAgentsToAdd])
    const filteredPersonalAgentsToAdd = useMemo(() => {
        const trimmed = tenantSearchTerm.trim().toLowerCase()
        if (!trimmed) return groupedPersonalAgentsToAdd

        return groupedPersonalAgentsToAdd
            .map(group => ({
                ...group,
                items: group.items.filter(item =>
                    item.tenant_display_name.toLowerCase().includes(trimmed)
                ),
            }))
            .filter(group => group.items.length > 0)
    }, [groupedPersonalAgentsToAdd, tenantSearchTerm])

useEffect(() => {
    if (!isModTenantInfo) return

    const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node

        if (tenantNameRef.current && !tenantNameRef.current.contains(target)) {
            setInfoModTenants()
        }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
        document.removeEventListener("mousedown", handleClickOutside)
    }
}, [isModTenantInfo])

    useEffect(() => {
        if (!openAgentId) return
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node
            if (agentListRef.current?.contains(target)) return
            setOpenAgentId(null)
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [openAgentId])

    const handleScrollDown = () => {
        const container = document.querySelector(".mainApp-scroll") as HTMLElement | null
        const delta = window.innerHeight
        if (container) {
        container.scrollBy({ top: delta, behavior: "smooth" })
        return
        }
        window.scrollBy({ top: delta, behavior: "smooth" })
    }

    if (isLoadingTenantData) {
        return (
            <div className="text-white max-content relative ml-10">
                <TenantSkeleton />
            </div>
        )
    }


    return(
        
        <div className={` text-white max-content relative ${isMobile ? " px-2" : " px-8"} overflow-x-hidden pb-4`}>
            {infoNotifiche && (
                <div
                className={`
                    fixed top-12 left-6 z-50
                    bg-white text-black rounded-md px-4 py-3 shadow-md
                    transition-[opacity,transform] duration-500 ease-in-out text-[0.8rem]
                    ${isClosing ? "opacity-0 translate-y-6" : "opacity-100 translate-y-0"}
                `}
                >
                <b>{t("tenant.message")}</b> {infoNotifiche}
                </div>
            )}
            <div className={`flex items-center flex-1  gap-4 mt-1`}>
                    <button 
                        onClick={() => navigate("/core/home")}
                        className={`bg-[#1e1e1e] p-2 rounded-sm mt-3 flex flex-row items-center gap-2 ${isMobile ? "none" : "block"}`}
                        style={{ display: isMobile ? "none" : "block" }}
                        >
                        <FaArrowLeft/>  
                    </button>
               

                {!isModTenantInfo ? (
                    <h1 className={` ${isMobile ? "text-[1rem] max-w-[300px] truncate ml-2 " : "text-[1.2rem]"} fzen text-[darkblue] dark:text-[#84abff] mt-4`}>
                        {nameTenant}
                    </h1>
                    ) : (
                    <div ref={tenantNameRef} className="relative mt-4 w-[280px]">
                    <input
                        name="nameInput"
                        type="text"
                            value= {tenantName}
                            onChange={(e) => setTenantName(e.target.value)}
                            className={`  ${isMobile ? "ml-1" : ""} peer w-full bg-transparent border border-gray-500 rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#648cfc]`}
                        />
                        <label className="absolute left-3 -top-3 bg-[#2c2c2c] px-2 text-blue-400 text-sm transition-all peer-focus:text-[#799cff]">
                        {t("tenant.workspaceName")}
                        </label>
                    </div>
                    )}

                    {isPersonal ? 
                    <span style={{ display: isMobile ? "none" : "" }} className={`flex items-center bg-[#ADFFDB] ${isMobile ? "px-1" : "px-4 flex-row"}  p-1 rounded-md text-[#05533B] gap-3 mt-3`}> <FaLock /> <p style={{ display: isMobile ? "none" : "" }}>{t("tenant.personal")}</p></span>
                        :
                    <span style={{ display: isMobile ? "none" : "" }} className={`flex items-center bg-blue-300 ${isMobile ? "px-1" : "px-4 flex-row"}  p-1 rounded-md text-blue-950 gap-3 mt-3`}> <FaUnlock  /> <p style={{ display: isMobile ? "none" : "" }}>{t("tenant.sharable")}</p></span>
                    }
                    {
                        !isModTenantInfo ?       
                        (  
                        <div className="relative">       
                            <button 
                                onClick={()=>{openModifyMenu(true)}}
                                className="bg-[#1D4ED8] p-1 rounded-md  mt-3  outline-none focus:outline-none focus:ring-0">
                                <HiDotsVertical  className="dark:text-[white] text-[16px]"/>
                            </button>
                            {isOpenMenuModiy &&                         
                                <div
                                    ref={modifyTenantRef} 
                                    className={`absolute top-3 ${isMobile ? "right-0" : ""} bg-[#3b3b3b] shadow-lg p-2 rounded-md px-3 text-[0.8rem]`}>
                                    <ul>
                                        <li 
                                            onClick={()=>{handleModifyInfoTenant(true)}}
                                            className="py-0.5  text-center  px-5 hover:bg-[#444] rounded-md">{t("tenant.modify")}</li>
                                        {!isPersonal && (
                                            <div className=" w-full  border-b border-[#4d4d4d] py-0.5 mb-0.5"/>
                                        )}
                                        {!isPersonal && (
                                            <li 
                                                onClick={()=>{handleLeaving()}}
                                                className="py-0.5  text-center  px-5 hover:bg-[#444] rounded-md ">{t("tenant.leave")}</li>
                                        )}
                                    </ul>
                                </div>
                            }

                        </div> 
                        )
                            :
                        <button 
                            onClick={()=>{ setInfoModTenants() }}
                            className="bg-[#1D4ED8] p-1 rounded-md px-3 mt-3  outline-none focus:outline-none focus:ring-0">
                            <FaCheck className="dark:text-[white] text-[20px]"/>
                        </button>
                    }
                    {!isPersonal&&
                        <div className="h-8 border-l-2 border-[#4e4e4e] mt-3" style={{ display: isMobile ? "none" : "block" }}/>
                    }                                   
                    {owner?.display_name
                        ? 
                        <span className="flex items-center gap-3 text-[1rem] mt-3 fzen" style={{ display: isMobile ? "none" : "" }}> 
                            <FaCrown className="text-yellow-400" />
                            {owner.display_name.charAt(0).toUpperCase() + owner.display_name.slice(1)}
                        </span>
                        :  
                        <span></span>
                    }              
            </div>
            <div className={`w-full flex flex-row flex-wrap mt-6 ${isMobile ? "" : "ml-4"}  gap-10`}>
                <div className={`flex flex-col gap-6  flex-1  ${isMobile ? "max-w-[500px] w-[95vw]" : "min-w-[420px]"}  max-w-[600px] `}> 
                    <div className={`dark:bg-[rgb(59,59,59)] ${isMobile ? "w-[95vw] h-max max-w-[420px]" : "w-[420px]"} flex flex-col w-full rounded-lg p-1 px-1 shadow-lg `}>
                        <div className={`flex flex-row flex-wrap h-16 `}>
                            <div className="dark:bg-[#2C2C2C] w-[max-content] m-1 text-[#CCC5C5] rounded-lg p-2 px-4 flex flex-row gap-4">
                                <div className="rounded-full h-10 w-10 bg-slate-500 shrink-0" />
                            </div>
                            <div className="dark:bg-[#2C2C2C] w-[max-content] m-1 text-[#CCC5C5] rounded-lg p-2 px-4 flex flex-row gap-4">
                                <span className="text-[0.85rem] flex flex-col leading-[20px] justify-center text-center">
                                    {t("tenant.createdAt")} 
                                    <span className="text-gray-400">
                                        {createdAt
                                        ? new Date(createdAt).toLocaleString("it-IT", {
                                            dateStyle: "short",
                                            timeStyle: "short",
                                            })
                                        : "Non Disponibile"}
                                    </span>
                                </span>
                                <span className="text-[0.85rem] flex flex-col leading-[20px] justify-center text-center">
                                    {t("tenant.updatedAt")} 
                                    <span className="text-gray-400">
                                        {updateAt
                                        ? new Date(updateAt).toLocaleString("it-IT", {
                                            dateStyle: "short",
                                            timeStyle: "short",
                                            })
                                        :  t("tenant.notAvailable")} 
                                    </span>
                                </span>
                            </div>
                            <div className="dark:bg-[#2C2C2C] w-[max-content] m-1 text-[#CCC5C5] rounded-lg p-2  flex flex-row gap-4">
                                <div className="rounded-lg bg-blue-500 shrink-0 text-white flex items-center  px-3 fzen text-[0.8rem] text-[200]  gap-2">
                                        <FaUser />
                                        <span > {members.length}</span>
                                </div>
                            </div>
                        </div>
                         <div className="dark:bg-[#2C2C2C] m-1 text-[#CCC5C5] rounded-lg p-1 px-3 leading-[30px] text-[0.9rem]">
                             {t("tenant.description")}:<br/>
                        </div>
                    </div>
                    {!isPersonal && 
                    <div className={`dark:bg-[#3b3b3b] ${isMobile ? "w-[95vw] max-w-[420px] " : "w-[420px]"} flex flex-col w-full rounded-lg p-3 pt-1.5  shadow-lg`}>
                        {}
                        <div className="relative"> 
                            <p className="font-[600] m-1 flex flex-row items-center gap-3 ">  {t("tenant.users")} </p>
                            {}
                            {myRoleName !== "user" && (
                                <>
                                {myRoleName !== "admin" && (
                                    <>
                                        {isEditingMember ?                            
                                            <button 
                                                onClick={()=>{openModifyUser(false)}}
                                                className="rounded-sm absolute -top-0 right-12 px-2 py-1.5 bg-[#1d4ed8] hover:bg-[#5f8aff]">
                                                <FaTimes size={14}/>
                                            </button>     
                                            :
                                            <button 
                                                onClick={()=>{openModifyUser(true)}}
                                                className="rounded-sm absolute -top-0 right-12 px-2 py-1.5 bg-[#1d4ed8] hover:bg-[#5f8aff]">
                                                <FaCog size={14}/>
                                            </button>      
                                        }
                                    </>
                                    )}
                                    {isDeletingMember 
                                        ? 
                                        <button 
                                            onClick={()=>{openDeleteUser(false)}}
                                            className="rounded-sm absolute -top-0 right-0 px-2 py-1.5 bg-[#2e2e2e] hover:bg-[#3b3b3b]">
                                            <FaTimes size={14} />
                                        </button>
                                        :
                                    <button
                                        onClick={()=>{openDeleteUser(true)}} 
                                        className="absolute rounded-sm -top-0 right-0 px-2 py-1.5 bg-red-500 hover:bg-red-300">
                                        <FaTrash size={14}/>
                                    </button>
                                    }
                                </>
                            )}
                       
                        </div>
                        <div className="dark:bg-[#2C2C2C] p-1 flex flex-col gap-1 h-[300px] overflow-y-auto scrollbar-brand rounded-md">
                            {/*ADDER MEMBERS */}
                            {!isDeletingMember && myRoleName !== "user" && (
                            isSearchingMember ? (
                                <div
                                key="newMember"
                                ref={addMemberRef}
                                className="relative dark:bg-[#3b3b3b] bg-[#f5f5f5] rounded-lg p-1 gap-3 w-full flex items-center justify-center
                                            hover:bg-slate-500 transition-[0.3s]"
                                >
                                <input 
                                    value={memberMail}
                                    onChange={(e) => setMemberMail(e.target.value)}
                                    className="p-2 outline-none focus:outline-none focus:ring-0 bg-[#4c4c4c] w-full rounded-md pr-[140px]"
                                    placeholder={t("tenant.insertMemberMail")}
                                    type="email"
                                />


                                <button 
                                    onClick={inviteMember}
                                    className="absolute right-0  flex items-center mr-2 bg-[#1d4ed8] py-1.5 px-2 rounded-sm"
                                >
                                    <FaUserPlus size={14}/>
                                </button>
                                </div>
                            ) : (
                                <div
                                className="dark:bg-[#3b3b3b] bg-[#f5f5f5] rounded-lg p-2 gap-3 w-full flex items-center justify-center
                                            hover:bg-slate-500 transition-[0.3s] text-[0.9rem]"
                                onClick={() => openAddMember(true)}
                                >
                                <FaPlus size={14} className="px-2 py-1 rounded-sm"/> {t("tenant.addMember")}
                                </div>
                            )
                            )}

                            {/*LIST MEMBERS */}
                            {members.map(member => (
                                <TenantMemberItem
                                    key={member.user_uuid}
                                    member={member}
                                    owner={owner}
                                    currentUserId={user.userId}
                                    isEditingMember={isEditingMember}
                                    isDeletingMember={isDeletingMember}
                                    onRoleChange={handleRoleChange}
                                    onDelete={deleteMember}
                                />
                            ))}
                        </div>
                    </div>
                    }
                </div>
                <div className={`${isMobile ? " w-[95vw] min-w-[320px] h-auto" : " min-w-[800px] w-[60%] max-h-[calc(100vh-170px)] overflow-y-auto mainApp-scroll"}    dark:bg-[#3b3b3b] rounded-md flex-col flex p-3 pt-1 flex-1`}> 
                    <div className="flex flex-row text-[0.9rem] items-center justify-center">
                        {!IsAddingAgent?                        
                            <button 
                                onClick={()=>{openAddAgent(true)}}
                                className="px-2 p-1.5 bg-blue-800 shadow-md ml-2">
                                <FaPlus/>
                            </button> :
                            <button 
                             onClick={()=>{openAddAgent(false)}}
                            className="px-2 rounded-sm p-1.5 bg-blue-800 shadow-md ml-2">
                                <FaTimes/>
                            </button>
                        }
                        {!isDeletingAgent ?
                            <button
                                onClick={()=>openDeleteAgent(true)} 
                                className="px-2 rounded-sm p-1.5 bg-red-500 shadow-md ml-2">
                                    <FaTrash/>
                            </button> :
                            <button
                                onClick={()=>openDeleteAgent(false)} 
                                className="px-2 rounded-sm p-1.5 bg-red-500 shadow-md ml-2">
                                    <FaTimes/>
                            </button>
                        }

                        {!isEditingAgent ?
                            <button 
                                onClick={()=>openModifyAgentName(true)}
                                className="px-2 rounded-sm p-1.5 bg-slate-500 shadow-md ml-2">
                                    <FaCog/>
                            </button> 
                             :
                            <button 
                                onClick={()=>openModifyAgentName(false)}
                                className="px-2 rounded-sm p-1.5 bg-slate-500 shadow-md ml-2">
                                    <FaTimes/>
                            </button>
                        }
                       
                        <div className="ml-auto mr-1 mb-1">
                            <button
                                onClick={()=>{toggleMenuPersonalAgnet()}}
                                className="px-2 rounded-sm p-1" >
                                    {isPersonalAgents ? t("tenant.personalAgents")  : t("tenant.globalAgents")}
                            </button>
                        </div>

                    </div>
                    <div
                        ref={agentListRef}
                        className="bg-[#2c2c2c] p-1 rounded-md min-h-[70vh] shadow-lg flex flex-col gap-1"
                    >
                        {IsAddingAgent &&
                            <div className="bg-[#3b3b3b] p-1 max-h-[170px] overflow-y-auto mainApp-scroll rounded-md mb-1">
                                <div className="bg-[#2c2c2c] p-1 flex items-center justify-center mb-1 rounded-md">
                                <input
                                    value={tenantSearchTerm}
                                    onChange={(e) => setTenantSearchTerm(e.currentTarget.value)}
                                    className="w-full p-1 rounded-md bg-[#2c2c2c] px-3"
                                    placeholder={t("tenant.searchTenant")}
                                />
                                </div>
                               {filteredPersonalAgentsToAdd.length === 0 ? (
                                    <div className="w-full text-center text-gray-400 py-3 text-sm">
                                        No agents available
                                    </div>
                                ) : (
                                    filteredPersonalAgentsToAdd.map(group => (
                                    <div key={group.agent_uuid} className="px-3 p-1.5 mt-1 bg-[#2c2c2c] rounded-sm w-full flex items-center">
                                        <div className="flex flex-col mr-2">
                                            <span>{group.agent_display_name}</span>
                                            {group.items.length > 1 ? (
                                                <span className="text-[0.75rem] text-gray-400">
                                                    {group.items
                                                        .map(
                                                            item =>
                                                                `${item.agent_display_name} · ${item.tenant_display_name}`
                                                        )
                                                        .join(" | ")}
                                                </span>
                                            ) : (
                                                <span className="text-[0.75rem] text-gray-400">
                                                    {group.items[0].tenant_display_name}
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            onClick={()=>{handleAddingAgentOfTenant(group.agent_uuid)}} 
                                            className="bg-blue-600 px-1.5 py-1 ml-auto rounded-sm ">
                                            <FaPlus size={14}/>
                                        </button>
                                    </div>
                                )))}
                            </div>

                        }                 
                            {agentsSeleceted.map(agent => (
                                <AgentTenantItem
                                    canDelete={myRoleName !== "user" || personalAgentIds.has(agent.agent_uuid)}
                                    key={agent.agent_uuid}
                                    agent={agent}
                                    isEditingAgent={isEditingAgent}
                                    isDeletingAgent={isDeletingAgent}
                                    isMobile={isMobile}
                                    isExpanded={openAgentId === agent.agent_uuid}
                                    onToggle={() => {
                                        setOpenAgentId(prev =>
                                            prev === agent.agent_uuid ? null : agent.agent_uuid
                                        )
                                    }}
                                    isAgentTenant={isAgentTenant}
                                />
                            ))}
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
        </div>
    )
}

export default Tenant
