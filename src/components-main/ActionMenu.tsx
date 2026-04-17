import React from 'react';
import { Link } from 'react-router-dom';
import {
FaProjectDiagram , FaTachometerAlt,
  FaThLarge, FaRegClipboard, 
  FaDesktop,
  FaNetworkWired,
  FaTerminal, 
} from 'react-icons/fa';

import { FaClockRotateLeft } from 'react-icons/fa6';

{/* Elenco funzioni */}
const menuItems = [
  {
    icon: FaRegClipboard,
    label: 'Report',
    path: '/core/tenant',
  },
  {
    icon: FaNetworkWired  ,
    label: 'NetScan Lan',
    path: '/core/scan',
  },
  {
    icon: FaProjectDiagram ,
    label: 'Rete',
    path: 'netscan/preset',
    disabled: true,
  },
  {
    icon: FaTachometerAlt,
    label: 'Metriche',
    path: '/core/metrics/',
  },
  {
    icon: FaTerminal,
    label: 'Mappa',
    path: '/core/log',
  },
  {
    icon: FaClockRotateLeft ,
    label: 'Rete',
    path: 'netscan/preset',
    disabled: true,
  },
  {
    icon: FaThLarge,
    label: 'Moduli',
    path: '/core/task',
  },

  {
    icon: FaDesktop,
    label: 'Sicurezza',
    path: '/core/monitoring',
  },

];

type ActionMenuProps = {
  disabled?: boolean;
};

const ActionMenu: React.FC<ActionMenuProps> = ({ disabled = false }) => {


  return (
    <div className="relative flex h-9 " >
      {/* Sidebar principale */}
      <div className="h-9.5 w-full flex-1 transition-all duration-300 bg-[#e0f0fd] dark:bg-[#141414] ">

        <nav
          className={`flex flex-row relative shadow-sm h-9  ${disabled ? " pointer-events-none opacity-50" : ""}`}
          aria-disabled={disabled}
        >
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
              >
                {item.disabled ? (
                  <div
                    aria-disabled="true"
                    aria-label="Coming soon"
                    className="
                      flex items-center h-9.5
                      border-l-2 border-[#2e2e2e]
                      px-3 opacity-50 cursor-default
                    "
                  >
                    <div className=" relative w-full flex flex-col items-center justify-center h-9 group ">
                      <Icon size={20} className="text-[#3559BE]" />
                      <span className="top-8 absolute mt-0.5 text-[0.7rem] font-semibold whitespace-nowrap uppercase tracking-wider text-[white] bg-white dark:bg-[#1b1b1b] px-1.5 py-0.5 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                        Coming soon
                      </span>
                    </div>
                  </div>
                ) : (
                  <Link
                    to={item.path}
                    className="
                      flex items-center h-9.5 
                      border-l-2 border-[#2e2e2e] 
                      px-3 transition-all duration-300
                      hover:bg-[#c0d0fd] 
                      hover:dark:bg-[#1a2337] 
                      dark:border-b-[#2C2C2C] 
                      hover:dark:border-b-[#1D4ED8]
                    "
                  >
                    <div className="w-full flex justify-center items-center h-9 group-hover:hidden">
                      <Icon size={20} className="text-[#3559BE]" />
                    </div>
                  </Link>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default ActionMenu;
