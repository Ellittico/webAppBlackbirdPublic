import logoApp from '../../assets/logo/logoApp.png'
import nameApp from '../../assets/logo/nameApp.png';
import { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { FaBars, FaDownload, FaLock, FaUnlock } from 'react-icons/fa';
import { getAvatarByIndex } from '../../utlis/pickPicFromIndex';
import { useIsMobile } from '../../utlis/useIsMobile';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { clearTenant } from '../../feature/tenants/tenantsSlice';
import { clearScan } from '../../feature/scan/scanSlice';
import { clearPerf } from '../../feature/performance/performanceSlice';
import { clearLogs } from '../../feature/log/logSlice';
import { clearTasks } from '../../feature/task/taskSlice';
import { clearUser } from '../../feature/user/userSlice';
import { clearRemoteAgents } from '../../feature/remoteAgent/remoteAgentSlice';
import { useNavigate } from 'react-router-dom';

type NavbarProps = {
  onToggleMenu?: () => void;
};

const Navbar: React.FC<NavbarProps> = ({ onToggleMenu }) => {
const navigate = useNavigate()
const { t } = useTranslation()
const [open, setOpen] = useState(false);
const avatarRef = useRef<HTMLDivElement | null>(null);
const menuRef = useRef<HTMLDivElement | null>(null);
const dispatch = useAppDispatch();
const { logout } = useAuth();
const tenantName = useAppSelector(state => state.tenant.info?.name);
const isPersonal = useAppSelector(state => state.tenant.info?.is_personal)
const userDisplayName = useAppSelector(
  state => state.auth.displayName || state.auth.email
);
const idPic = useAppSelector(state => state.auth.profile_pic)
const isMobile = useIsMobile(1000);
useEffect(() => {
  if (!open) return;
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as Node;
    if (menuRef.current?.contains(target)) return;
    if (avatarRef.current?.contains(target)) return;
    setOpen(false);
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, [open]);

const handleLogout = () => {
  dispatch(clearTenant());
  dispatch(clearScan());
  dispatch(clearPerf());
  dispatch(clearLogs());
  dispatch(clearTasks());
  dispatch(clearUser());
  dispatch(clearRemoteAgents());
  logout();
  setOpen(false);
};

return (
    <header
      className="relative top-0 left-0 w-[100vw] h-[47px] bg-[#bbd4ea]
                 dark:bg-[#000000] text-white flex flex-row justify-between
                 items-center  z-50 shadow"
      style={{ 
        paddingLeft: isMobile ? "10px" : "24px" , 
        paddingRight: isMobile ? "10px" : "24px" 
      }}
    >
      {/* Logo / Burger */}
      <div className="flex items-center justify-center w-max">
        {isMobile ? (
          <button
            type="button"
            onClick={onToggleMenu}
            className="h-9 w-9 rounded-md p-0 bg-[#1e1e1e] dark:bg-[#0f0f0f] flex items-center justify-center"
            aria-label="Apri menu"
          >
            <FaBars size={16} color='gray'/>
          </button>
        ) : (
          <>
            <img src={logoApp} alt="Logo" />
            <img src={nameApp} alt="Name" />
          </>
        )}
      </div>

      {/* Tenant */}
      <div className="flex items-center justify-center bg-[#181818] w-max mx-auto rounded-md px-5 py-1">
        {tenantName ? (
          <span className="text-[#1D4ED8] text-[0.8rem] truncate dark:text-white font-normal flex flex-row gap-3">
            <span className='max-w-[150px] truncate'>{tenantName}</span>
            {isPersonal ?
              <span className='flex flex-row bg-[#3b3b3b] px-2 items-center gap-2 rounded-sm p-[1px]'> 
                <FaLock size={12}/>
                <span  style={{ display: isMobile ? "none" : "block" }}>{t("navbar.private")}</span>
              </span>
              : 
              <span className='flex flex-row bg-[#3b3b3b] px-2 items-center gap-2 rounded-sm p-[1px]'> 
                <FaUnlock size={12}/>
                <span  style={{ display: isMobile ? "none" : "block" }}>{t("navbar.shared")}</span>
              </span>
            }
          </span>
        ) : (
          <span className="text-gray-500 dark:text-gray-400 text-[0.8rem]">
           <button onClick={()=>{ navigate('/core/download', { replace: true })}} className='flex flex-row gap-2 p-0 items-center'><FaDownload/> Agent </button>
          </span>
        )}
      </div>

      {/* Avatar */}
      <div className="relative flex justify-end  items-center gap-2"  style={{ width: isMobile ? "max-content" : "" }}>
        <span className="text-[#1D4ED8] dark:text-white text-sm tablet-lg:text-red"  style={{ display: isMobile ? "none" : "block" }}>
          {userDisplayName}
        </span>
        <div
          ref={avatarRef}
          className="  w-9 h-9 rounded-full bg-slate-500 flex items-center justify-center cursor-pointer text-white font-medium"
          onClick={() => setOpen(!open)}
        >
          <img src={getAvatarByIndex(idPic)} className='rounded-full'/>
        </div>
        {open && (
          <div
            ref={menuRef}
            className='absolute bg-[#1e1e1e] shadow-md rounded-sm p-3 px-6 text-[0.9rem] top-[40px]'
          >
            <button
            onClick={handleLogout}
            >
              Abbandona
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;
