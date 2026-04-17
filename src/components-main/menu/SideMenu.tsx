import { useState } from "react"
import { FaCog, FaHome } from "react-icons/fa"
import { HiChevronDoubleRight } from "react-icons/hi"
import { useAppDispatch, useAppSelector } from "../../store/hooks"
import { Link, useNavigate } from "react-router-dom"
import { clearTenant, setScopedToken, setTenantInfo } from "../../feature/tenants/tenantsSlice"
import { selectTenant } from "../../api/tenants/tenant.select-tenant"
import { selectSettingTenant } from "../../api/tenants/tenant.select-setting"
import { clearScan } from "../../feature/scan/scanSlice"
import { clearPerf } from "../../feature/performance/performanceSlice"
import { clearLogs } from "../../feature/log/logSlice"
import { clearTasks } from "../../feature/task/taskSlice"
import { clearRemoteAgents } from "../../feature/remoteAgent/remoteAgentSlice"
import { refreshSession } from "../../api/auth/auth.refresh.api"
import { setFullSession } from "../../feature/auth/authSlice"
import { useIsMobile } from "../../utlis/useIsMobile"
import { useTranslation } from "react-i18next"


type SideMenuProps = {
  isOpen?: boolean
  onClose?: () => void
}

export default function SideMenu({ isOpen, onClose }: SideMenuProps) {
  const { t } = useTranslation()
  const isMobile = useIsMobile(1000)
  const tenants = useAppSelector(state => state.auth.tenants)
  const [hoverTenantId, setHoverTenantId] = useState<string | null>(null)
  const [hovered, setHovered] = useState(false)
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  
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
      if (isMobile) onClose?.()
    } catch (error) {
      console.error("handleSelectedTentant: error " + error)
      const response = await refreshSession()
       dispatch(setFullSession(response))

      navigate("/core")
      if (isMobile) onClose?.()
    }
  }

  if (isMobile && !isOpen) {
    return null
  }

  return (
    <>
    {isMobile && (
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />
    )}
    <aside
      className={`flex shadow-lg z-50 ${
        isMobile
          ? "fixed top-[47px] left-0 h-[calc(100vh-47px)]"
          : "relative h-[calc(100vh-47px)]"
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* BASE SIDEBAR — OCCUPA SPAZIO */}
      <div className="w-[56px] bg-[#e0f0fd] dark:bg-[#1E1E1E] flex flex-col items-center">
        
        {/* HOME */}
        <Link 
           to="/core"
           className="h-[50px] flex items-center justify-center text-[#2553b6] "
           onClick={onClose}
        >
          <FaHome size={22} />
        </Link>
        <div className="border-b border-[#3b3b3b] w-full"/>

        {/* TENANTS */}
        <div className="flex-1 max-h-[calc(100%-100px)] overflow-y-auto flex flex-col items-center w-full  py-2">
          {tenants.map(t => (
            <div
              key={t.id}
              className={`w-full ${
                hoverTenantId === t.id ? "bg-[#2553b638]" : ""
              }`}
              onMouseEnter={() => setHoverTenantId(t.id)}
              onMouseLeave={() => setHoverTenantId(null)}
            >

            <div

              onClick={()=>{handleSelectedTentant(t.id)}}
              className="w-[36px] h-[36px] rounded-full bg-slate-400 text-blue-950 hover:text-blue-950 flex items-center justify-center text-xs my-[6px] mx-auto capitalize"
              title={t.name}
            >
              {t.name[0]}
            </div>
            </div>
          ))}
        </div>

        {/* SETTINGS */}
        <div className="w-full">
          <div className="border-b border-[#3b3b3b] w-full  "/>
          <Link
            to="/core/personalization"
            className="h-[50px] flex items-center justify-center flex-col  text-[#2553b6]"
            onClick={onClose}
          >
          <FaCog size={22} />
          </Link>
        </div>
      </div>

      {/* OVERLAY — NON OCCUPA SPAZIO */}
      {(hovered || isMobile) && (
        <div
          className="
            absolute left-[56px]
            top-0
            w-[220px]
            h-full
            bg-[#e0f0fd] dark:bg-[#1E1E1E]
            shadow-xl z-50
          "
        >
          <nav className="flex flex-col h-full ">
            <Link
              to="/core"
              className="group  h-[50px] flex items-center text-slate-300 fzen font-thin pr-4 pt-1.5 text-[0.75rem] hover:text-gray-400"
              onClick={onClose}
            >
              <span>{t("sidemenu.home")}</span>
              <HiChevronDoubleRight className="ml-[auto] text-white hover:text-gray-300" size={18}/>
            </Link>
            <div className="border-b border-[#3b3b3b] w-full"/>

            <div className="flex-1 overflow-y-auto space-y-0 mt-2">
              {tenants.map(t => (
                <div
                  key={t.id}
                  onClick={()=>{handleSelectedTentant(t.id)}}
                  onMouseEnter={() => setHoverTenantId(t.id)}
                  onMouseLeave={() => setHoverTenantId(null)}
                  className={`flex items-center gap-3 px-2 py-2 h-[48px] ${
                    hoverTenantId === t.id ? "bg-[#2553b638]" : ""
                  }`}
                >


                  <span className="text-sm  text-slate-300  hover:text-gray-400 w-[200px] truncate">{t.name}</span>
                </div>
              ))}
            </div>
             <div className="border-b border-[#3b3b3b] w-full"/>
            <Link
              to="/core/personalization"
              className="h-[50px] flex items-center  text-slate-300  hover:text-gray-400  fzen font-thin text-[0.75rem]"
              onClick={onClose}
            >
              <span className="mt-1">{t("sidemenu.settings")}</span>
              <HiChevronDoubleRight className="ml-[auto] text-white hover:text-gray-300 mr-4" size={18}/>
            </Link>
          </nav>
        </div>
      )}
    </aside>
    </>
  )
}
