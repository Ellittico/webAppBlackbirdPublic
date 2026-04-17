import { useEffect, useRef, useState } from 'react'
import './styles/App.css'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import Navbar from './components-main/navbar/Navbar'
import SideMenu from './components-main/menu/SideMenu'
import Home from './pages/Home'
import Tenant from './pages/Tenant'
import ActionMenu from './components-main/ActionMenu'
import ScanLan from './pages/ScanLan'
import { useAppDispatch, useAppSelector } from './store/hooks'
import { connectTenantSocket, disconnectTenantSocket } from './ws/tenantSocket'
import { clearTenant } from './feature/tenants/tenantsSlice'
import { resetScans } from './feature/scan/scanSlice'
import UserPersonalization from './pages/UserPersonalization'
import GeneralMetrics from './pages/GeneralMetrics'
import { LogPage } from './pages/Logpage'
import TaskManager from './pages/TaskManager'
import { useIsMobile } from './utlis/useIsMobile'
import { Monitoraggio } from './pages/Monitoraggio'
import Download from './pages/Download'

function Core() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useIsMobile(1000)
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const sessionToken = useAppSelector(state => state.auth.sessionToken)
  const tenantId = useAppSelector(state => state.tenant.info?.tenant_id)
  const thisAgentUuid = useAppSelector(state => state.tenant.thisAgentUuid)
  const didHandleReload = useRef(false)
  const isHome =
    location.pathname === '/core' ||
    location.pathname === '/core/home' ||
    location.pathname.endsWith('/home')

  useEffect(() => {
    if (sessionToken && tenantId) {
      connectTenantSocket(sessionToken, tenantId)
      return () => disconnectTenantSocket()
    }
    disconnectTenantSocket()
    return undefined
  }, [sessionToken, tenantId])

  useEffect(() => {
    if (isHome) {
      dispatch(clearTenant())
      dispatch(resetScans())
    }
  }, [isHome, dispatch])

  useEffect(() => {
    if (!isMobile && isMenuOpen) {
      setIsMenuOpen(false)
    }
  }, [isMobile, isMenuOpen])

  useEffect(() => {
    if (didHandleReload.current) {
      return
    }

    const navEntries = performance.getEntriesByType?.('navigation') as PerformanceNavigationTiming[]
    const navType = navEntries?.[0]?.type
    const legacyReload = performance && 'navigation' in performance && performance.navigation?.type === 1
    const isReload = navType === 'reload' || legacyReload

    if (isReload && !isHome) {
      navigate('/core/home', { replace: true })
    }

    didHandleReload.current = true
  }, [isHome, navigate])
  
 return (
  <div  
    className={`mt-0 
               bg-[white]
              dark:bg-[#1e1e1e]`}
  >
    <Navbar onToggleMenu={() => setIsMenuOpen(prev => !prev)} />

    {/*<WSStatusOverlay status={wsStatus} />*/}
    <div className='flex flex-row  h-[calc(100vh-47px)] bg-[#2e2e2e] relative'  >

      {/* Se in setting il menu non è visualizzato */}
        <SideMenu
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
        />

        <div className={` max-h-[calc(100vh-47px)] h-[auto] w-[calc(100%)] ${isMobile ? "overflow-x-hidden" : "overflow-y-auto "}  mainApp-scroll`}>
        {!isHome && <ActionMenu disabled={!thisAgentUuid} />}
        <Routes>
          <Route index element={<Home />} />
          <Route path="home" element={<Home />} />
          <Route path="tenant" element={<Tenant />} />
          <Route path="scan" element={<ScanLan />} />
          <Route path="metrics" element={<GeneralMetrics/>}/>
          <Route path='personalization' element={<UserPersonalization/>}/>
          <Route path='log' element={<LogPage/>}/>
          <Route path='task' element={<TaskManager/>}/>
          <Route path='monitoring' element={<Monitoraggio/>}/>
          <Route path='download' element={<Download/>}/>
        </Routes>

        </div>
    </div>

    {/* Version */}
    <span className="fixed bottom-[10px] right-[0px] mx-[10px] bg-[#1D4ED8] px-[5px] text-xs text-white z-[999999999]">
      v0.1.4-internal
    </span>

  </div>
  )
}

export default Core
