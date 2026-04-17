import { useEffect, useState } from "react"
import { useAppSelector } from "../store/hooks"
import { useAppDispatch } from "../store/hooks"
import { addTenant as addTenantApi} from "../api/tenants/tenants.add.api"
import { addTenant, setAgentsUser, setFullSession } from "../feature/auth/authSlice"
import { selectTenant } from "../api/tenants/tenant.select-tenant"
import { clearTenant, setScopedToken,setTenantInfo } from "../feature/tenants/tenantsSlice"
import { clearScan } from "../feature/scan/scanSlice"
import { clearPerf } from "../feature/performance/performanceSlice"
import { clearLogs } from "../feature/log/logSlice"
import { clearTasks } from "../feature/task/taskSlice"
import { clearRemoteAgents } from "../feature/remoteAgent/remoteAgentSlice"
import { selectSettingTenant } from "../api/tenants/tenant.select-setting"
import { useNavigate } from "react-router-dom"
import { getAgentFromUser } from "../api/agent/agent.user-full"
import { loadUserInvite } from "../api/user/user.invite.list"
import { setUserInvites, setUserInvitesLoading } from "../feature/user/userSlice"
import { rejectUserInvite } from "../api/user/user.reject.invite"
import { accepttUserInvite } from "../api/user/user.accept.invite"
import { refreshSession } from "../api/auth/auth.refresh.api"
import { useAuth } from "../context/AuthContext"


export function useHomeControls() {
  const { authReady } = useAuth()


  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const workspaces = useAppSelector(state => state.auth.tenants)
  const sessionToken = useAppSelector(state => state.auth.sessionToken)
  const agents = useAppSelector(state => state.auth.agents)
  const invites = useAppSelector(state => state.user.invites)
  const invitesLoaded = useAppSelector(state => state.user.invitesLoaded)

  const [isClosing, setIsClosing] = useState(false)
  const [isOpenAddWork, setOpenAddWork] = useState(false)

  const [inputValWorkName, setinputValWorkName] = useState("")
  const [info,setInfo] = useState<String | null>(null)
  const [isLoadingHome, setIsLoadingHome] = useState(true)



  //RICHIESTA A CARICAMENTO PAGINA AGENTI
useEffect(() => {
  if (!authReady || !sessionToken) {
    setIsLoadingHome(true)
    return
  }

  const load = async () => {
    try {
      setIsLoadingHome(true)
      dispatch(setUserInvitesLoading())

      const [response, invitesResponse] = await Promise.all([
        getAgentFromUser(),
        loadUserInvite(),
      ])

      dispatch(setAgentsUser(response.items))
      dispatch(setUserInvites(invitesResponse.data?.invites ?? []))
    } catch (error) {
      console.error("load error:", error)
    } finally {
      setIsLoadingHome(false)
    }
  }

  load()
}, [authReady, sessionToken, dispatch])


  //RICHIESTA SCOPED TOKEN
  const handleSelectedTentant = async (tenant_id: string) =>{
    try {
      dispatch(clearTenant())
      dispatch(clearScan())
      dispatch(clearPerf())
      dispatch(clearLogs())
      dispatch(clearTasks())
      dispatch(clearRemoteAgents())
      const response = await selectTenant({tenant_id})
      dispatch(setScopedToken(response))
      const secondReponse = await selectSettingTenant(response.scoped_token)
      dispatch(setTenantInfo(secondReponse))
      navigate("/core/tenant", { replace: true })
    } catch (error) {
      console.error("handleSelectedTentant: error " + error)
    }
  }

  //OPEN MENU AGGIUNTA WORKSPACE
  const handleOpenWork = (val: boolean): void => {
    setOpenAddWork(val)
  }

  //CHIAMATA E AGGIUNTA NUOVO WORKSPACE
  const handleAddWork = async () =>{
    const regex = /^[a-zA-Z0-9 ]+((\-)|(__)|(@)|(\.))?[a-zA-Z0-9 ]*$/
    const data = {name : inputValWorkName}
    if (
        inputValWorkName.length > 0 &&
        regex.test(inputValWorkName)
    ) {
        try {
            const response = await addTenantApi(data)
            showMessage("Nuovo WorkSpace Aggiunto")
            dispatch(addTenant({
              id: response.tenant_id, 
              name: response.name,
              is_personal: response.is_personal
            }))
            setOpenAddWork(false)
            setinputValWorkName("")
            return;
        } catch (error) {
            setInfo("Errore nell'aggiunta WorkSpace")
            console.error("handleAddWork: error " + error)
        }
    }else{
        setInfo("Nome Workspace incorretto")
        console.error("handleAddWork: Not passed " )
      

  //TO DO CONTROLLARE NOMI
    }
  }


  //SET NOTICHE
  const showMessage = (text: string) => {
    setInfo(text)
    setIsClosing(false)
  }

  useEffect(() => {
    if (!info) return

    // dopo 2.5s parte animazione
    const closeTimer = setTimeout(() => {
      setIsClosing(true)
    }, 2500)

    // dopo 3s sparisce
    const removeTimer = setTimeout(() => {
      setInfo(null)
      setIsClosing(false)
    }, 3000)

    return () => {
      clearTimeout(closeTimer)
      clearTimeout(removeTimer)
    }
  }, [info])

  const handleRejectInvite = async (invite_token:string) => {
    const res = await rejectUserInvite(invite_token)
    //console.log(res)
     if(res.data.status !== "accepted") {showMessage("C'è stato un errore nel declino dell'invito"); return}
    const newInvites = await loadUserInvite()
    dispatch(setUserInvites(newInvites.data.invites))
  }

  const handleAcceptInvite = async (invite_token:string) =>{
    //invito accettato
    const res = await accepttUserInvite(invite_token)
    if(res.data.status == "already_member") {showMessage("Già membro"); return}
    //if(res.data.status !== "accepted") {showMessage("C'è stato un errore nell'aggiunta"); return}

    //cancello inviti
    const newInvites = await loadUserInvite()
    //console.log(newInvites)
    dispatch(setUserInvites(newInvites.data.invites))

    //refresh sessione tenat --> elenco corretto
    const data = await refreshSession()
    dispatch(setFullSession(data))
  }


  return {
    handleSelectedTentant,
    info,agents,
    isClosing,
    showMessage,
    workspaces,
    inputValWorkName, setinputValWorkName,
    isOpenAddWork,
    handleOpenWork,
    handleAddWork,
    isLoadingHome,
    invites,invitesLoaded,handleRejectInvite,handleAcceptInvite,
  }
}



