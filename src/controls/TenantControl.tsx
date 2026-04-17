import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useAppDispatch, useAppSelector } from "../store/hooks"
import { selectMembersTenants } from "../api/tenants/tenant.members-list"
import { deleteMemberReducer, fetchAgentsFromTenantThunk, setAgentofTenant, setAgentoPersonalfTenant, setTenantMembers, setUpdateTenantInfo, /*updateSingleMember */} from "../feature/tenants/tenantsSlice"
import { setTenantInfoUpdate } from "../api/tenants/tenant.setting-update"
import { inviteMemberTenant } from "../api/tenants/tenant.invite"
import axios from "axios"
import { deleteMemberApi } from "../api/tenants/tenant.delete-member"
import { updateRoleApi } from "../api/tenants/tenant.update-role"
import { selectAgentsFromTenant } from "../api/tenants/tenant.agent-list-full"
import { selectAgentsPersonalFromTenant } from "../api/tenants/tenant-agent-list-personal"
import type { AgentListUserItem } from "../types/auth.types"
import type { AgentTenant } from "../types/tenants.type"
import { AddAgentToTenant } from "../api/tenants/teant.add-agent"
import { useClickOutside } from "../utlis/useClickOutside"
import { useNavigate } from "react-router-dom"
import { refreshSession } from "../api/auth/auth.refresh.api"
import { setFullSession } from "../feature/auth/authSlice"

export function useTenantControls() {

    const navigate = useNavigate()
    // USES
    const scopedToken = useAppSelector(state => state.tenant.scopedToken)
    const tenantId = useAppSelector(state => state.tenant.info?.tenant_id)
    const nameTenant = useAppSelector(state => state.tenant.info?.name)
    const isPersonal= useAppSelector(state => state.tenant.info?.is_personal)
    const createdAt = useAppSelector(state => state.tenant.info?.created_at)
    const updateAt = useAppSelector(state => state.tenant.info?.updated_at)

    const dispatch = useAppDispatch()
    const addMemberRef = useRef<HTMLDivElement | null>(null)
    const modifyTenantRef = useRef<HTMLDivElement | null>(null)

    //CONST
    //data input hooks
    const [tenantName, setTenantName] = useState(nameTenant ?? "")
    const [memberMail,setMemberMail] = useState("")

    //Notifiche
    const [infoNotifiche,setInfoNotifiche] = useState<String | null>(null)

    //boolean Hooks
    const [isDeletingMember, setIsDeletingMember] = useState(false)
    const [isEditingMember, setIsEditingMember] = useState(false)
    const [isEditingAgent, setIsEditingAgent] = useState(false)
    const [isSearchingMember, setIsSearchingMember] = useState(false)
    const [isModTenantInfo, setIsModTenantInfo] = useState(false)
    const [isPersonalAgents, setIsPersonalAgents] =useState(false)
    const [isClosing, setIsClosing] = useState(false)
    const [isDeletingAgent, setIsDeletingAgent]= useState(false)
    const [IsAddingAgent, setIsAddingAgent] = useState(false)
    const [isOpenMenuModiy, setisOpenMenuModiy] = useState(false)
    const [isLoadingTenantData, setIsLoadingTenantData] = useState(true)

    //state info
    const members = useAppSelector(state => state.tenant.members) 
    const owner = useMemo(
        () => members?.find(member => member.role_id === 1),
        [members]
    )
    const user = useAppSelector(state => state.auth)
    const agents = useAppSelector(state => state.tenant.agents ?? [])
    const agentsPersonal = useAppSelector(state => state.tenant.personalAgent ?? [])

    const personalAgentIds = useMemo(
        () => new Set(agentsPersonal.map(a => a.agent_uuid)),
        [agentsPersonal]
    )

    const agentsSeleceted = useMemo(() => {
        // GLOBALI → tutti gli agenti del tenant
        if (!isPersonalAgents) return agents

        // PERSONALI → solo agenti del tenant che sono anche personali
        return agents.filter(agent =>
            personalAgentIds.has(agent.agent_uuid)
        )
    }, [isPersonalAgents, agents, personalAgentIds])

    const tenantAgentIds = useMemo(
        () => new Set(agents.map(a => a.agent_uuid)),
        [agents]
    )

    const personalAgentsToAdd = useMemo(() => {
        return user.agents.filter(
            agent => !tenantAgentIds.has(agent.agent_uuid)
        )
    }, [user.agents, tenantAgentIds])

    useEffect(() => {
        // condizioni minime
        if (!scopedToken || !tenantId) return

        // se gli agenti NON ci sono, li carico
        if (agents.length === 0) {
            //console.log("chiamata")
            dispatch(fetchAgentsFromTenantThunk())
        }
        }, [
        scopedToken,
        tenantId,
        agents.length,
        dispatch,
    ])


    //CONTROLLO PRIVILEGI
    const myUserUuid = user.userId // o da session/auth store
    const myMember = useMemo(
        () => members?.find(m => m.user_uuid === myUserUuid),
        [members, myUserUuid]
    )

    const myRoleName = myMember?.role_name ?? "user"


    //RICHIEDE LISTA UTENTI E AGENTI WORKSPACE
    useEffect(() => {
    if (!scopedToken || !tenantId) return

    const loadData = async () => {
        try {
        setIsLoadingTenantData(true)
        const [membersRes] = await Promise.all([
            selectMembersTenants(scopedToken),
        ])

        dispatch(setTenantMembers(membersRes.members))
        } finally {
        setIsLoadingTenantData(false)
        }
    }

    loadData()
    }, [scopedToken, tenantId])




    //CARICO AGENTI PERSONALI ALL'INIZIO
    useEffect(() => {
        if (!tenantId ) return
        if (agentsPersonal.length > 0) return // cache

        const loadPersonalAgents = async () => {
            try {
            const res = await selectAgentsPersonalFromTenant(tenantId )
            //console.log("personal",res)
            dispatch(setAgentoPersonalfTenant(res.items))
            } catch (e) {
            console.error(e)
            }
        }

        loadPersonalAgents()
    }, [tenantId , agentsPersonal.length])

    //GUARDIA DEI TIPI DIVERSI DI AGENT E AGENTPERSONAL
    const isAgentTenant = useCallback(
        (agent: AgentListUserItem | AgentTenant): agent is AgentTenant => {
            return "agent_name" in agent
        },
        []
    )

    //OPEN OR CLOSE MENU MODIFICA INFO TENANT
    const handleModifyInfoTenant = (val: boolean) => {
        setIsModTenantInfo(val)
        setisOpenMenuModiy(false)
    }

    //INVIO MODIFICHE INFO TENANT
    const setInfoModTenants = async () =>{
        //TO DO FIX: AGGIUNGERE AGENTS USERS E BILLING ID
        if (tenantId ) return
        if(scopedToken ) return
        if(!nameTenant) return

        if(nameTenant.trim() === tenantName.trim()) {setIsModTenantInfo(false); return}//effettivamente nessuna modifica
        if(tenantName.length > 51) {showMessage("Nome Workspace Troppo lungo!"); return}
        const data = {
            name: tenantName.trim(),
        }
        try {
            //console.log(data)
            const response = await setTenantInfoUpdate(data)
            if(response.success){
                //console.log("RESULT " + response.success)
                dispatch(setUpdateTenantInfo(data))
                setIsModTenantInfo(false)
                showMessage("Modifica dati avvenuta!")
            }
        } catch (error) {
            showMessage("Errore: Informazioni non aggiornata!")
        }
    }

    //OPEN OR CLOSE MENU AGGIUNTA MEMBRI TENANT
    const openAddMember = useCallback((val: boolean) => {
        setIsSearchingMember(val)
    }, [])

    const openModifyMenu = useCallback((val: boolean) => {
        setisOpenMenuModiy(val)
    }, [])

    //CHIUDE IL MENU UTENTI CLICCANDO FUOEI
    useClickOutside( // menu adding agenti
        addMemberRef,
        isSearchingMember,
        () => openAddMember(false)
    )

    useClickOutside( // menu adding agenti
        modifyTenantRef,
        isOpenMenuModiy,
        () => openModifyMenu(false)
    )

    //INVITO MEMBRO CON CONTROLLO NOME
    const inviteMember = async () => {
    // controllo duplicati lato frontend
    const doubleUser = members?.find(
        member => member.email === memberMail
    )
    if (doubleUser) {
        showMessage("Utente già presente!")
        return
    }

    const data = {
        email: memberMail.toLowerCase(),
        //role_id: memberRole,
    }

    try {
        // invito
        //console.log("Dati",data)
        const response = await inviteMemberTenant(data)
        if (response.status !== "pending") return
        //console.log("response",response)
        showMessage("Richiesta aggiunta effettuata!")

    } catch (error) {
        if (axios.isAxiosError(error)) {
        const status = error.response?.status
        switch (status) {
            case 409:
            showMessage("Utente già presente nel workspace")
            break
            case 500:
            showMessage("Utente non registrato")
            break
            default:
            showMessage("Errore nell'aggiunta, riprova più tardi")
        }
        }
    }
    }


    //OPEN MEMBER DELETION
    const openDeleteUser = useCallback((val: boolean) => {
        setIsDeletingMember(val)
        if (val) setIsEditingMember(false)
    }, [])


    //DELETE MEMBER 
    const deleteMember = async (uuid:string)=>{
        
        if(!uuid) return
        try {
           const response = await deleteMemberApi(uuid);
           //console.log(response)
           if(response.status === "removed"){
                dispatch(deleteMemberReducer(uuid))
           }

        } catch (err) {
            console.error(err)
            showMessage("Errore: Impossibile eliminare Utente")
        }
    }

    //OPEN MEMBER ROLE EDITING MENU
    const openModifyUser = (val:boolean)=>{
        setIsEditingMember(val)
        if(val){setIsDeletingMember(false)}
    }

    //UPDATING ROLE MEMBER
    const handleRoleChange = async (role_id:number, user_uuid:string)=>{
        const data = {role_id: role_id, user_uuid: user_uuid}
        //console.log(data)
        
        try {
            const response = await updateRoleApi(data)
            setIsEditingMember(false)
            if(response.data.status==="updated"){
                //dispatch(updateSingleMember(response.data))
            }
        } catch (error) {
            console.error(error)
        }/**/
    }

    //OPEN NAME EDITING AGENT
    const openModifyAgentName = (val:boolean)=>{
       setIsEditingAgent(val)
        if(val){setIsDeletingAgent(false)}
        if(val){setIsAddingAgent(false)}
    }

    //OPEN DELETE AGENT
    const openDeleteAgent = (val:boolean)=>{
        setIsDeletingAgent(val)
        if(val){setIsEditingAgent(false)}
        if(val){setIsAddingAgent(false)}
    }

    //OPEN ADDER MENU AGENT
    const openAddAgent = (val:boolean)=>{
        setIsAddingAgent(val)
        if(val){setIsDeletingAgent(false)}
        if(val){setIsEditingAgent(false)}
    }

    const handleAddingAgentOfTenant = async (agent_id:string)=>{
        if(!agent_id) return
        try {
            const response = await AddAgentToTenant(agent_id)
            if (scopedToken &&response.data.assigned > 0) {
                const agentsRes = await selectAgentsFromTenant(scopedToken )
                //console.log("second Response: ",agentsRes)
                dispatch(setAgentofTenant(agentsRes.agents))
                setIsAddingAgent(false)
            }
        } catch (error) {
            console.error(error)
        }
    }

    //FILTER AGENTI PERSONALE
    const toggleMenuPersonalAgnet = useCallback(() => {
         setIsPersonalAgents(prev => !prev)
    }, [])


    //SET NOTIFICHE
    const showMessage = (text: string) => {
        setInfoNotifiche(text)
        setIsClosing(false)
    }

    useEffect(() => {
        if (!infoNotifiche) return

        // dopo 2.5s parte animazione
        const closeTimer = setTimeout(() => {
            setIsClosing(true)
        }, 2500)

        // dopo 3s sparisce
        const removeTimer = setTimeout(() => {
        setInfoNotifiche(null)
        setIsClosing(false)
        }, 3000)

        return () => {
        clearTimeout(closeTimer)
        clearTimeout(removeTimer)
        }
    }, [infoNotifiche])

    const handleLeaving = async () =>{
        if(!user) return
        const response = await deleteMemberApi(user.userId);
        if(response.status !== "removed") {showMessage("Impossibile Abbandonare!");return}
        navigate("/core")
        const responseRefresh = await refreshSession()
         dispatch(setFullSession(responseRefresh))
    }

  return {
    tenantId,scopedToken ,personalAgentIds ,nameTenant, isPersonal,createdAt,updateAt,
    members,owner,user,myRoleName,agents,agentsSeleceted,isAgentTenant,personalAgentsToAdd,
    handleModifyInfoTenant, setIsModTenantInfo, isModTenantInfo,
    setTenantName,tenantName, setInfoModTenants,
    openAddMember, isSearchingMember, isOpenMenuModiy,openModifyMenu,
    addMemberRef,modifyTenantRef,
    memberMail,setMemberMail,inviteMember,
    infoNotifiche,isClosing,
    openDeleteUser,
    isDeletingMember, setIsDeletingMember, deleteMember,
    isEditingMember, setIsEditingMember, openModifyUser, handleRoleChange,
    isEditingAgent,setIsEditingAgent ,openModifyAgentName,
    isDeletingAgent,openDeleteAgent,
    toggleMenuPersonalAgnet,isPersonalAgents,
    isLoadingTenantData,
    IsAddingAgent,openAddAgent,handleAddingAgentOfTenant,handleLeaving,
    
  }
}

