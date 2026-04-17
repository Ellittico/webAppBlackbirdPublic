import React, { useState, useRef, useEffect } from "react";
import { useIsMobile } from "../../../utlis/useIsMobile";


//uses text and icon
interface TooltipIconProps {
  text: string;
  children: React.ReactNode;
}

const TooltipIcon: React.FC<TooltipIconProps> = ({ text, children }) => {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile(1000)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setShow(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block mt-2 text-left" ref={ref}>
      <div className="cursor-pointer flex items-center justify-center" onClick={() => setShow(prev => !prev)}>
         <span className="ml-[6px] h-[30px] w-[30px] p-[2px] bg-[#e0f0fd] dark:bg-[#000000] flex items-center justify-center rounded-full">
            {children}
        </span>
      </div>
      {show && (
        <div className={`fixed top-[30px] left-0 z-50 ${isMobile ? " w-[90vw] left-2 top-24 shadow-lg" : " w-[490px]"}  bg-[white] dark:bg-[#303030] text-[darkblue] dark:text-white text-[0.9rem] p-[5px] rounded-[5px] shadow-lg `}>
          <p 
            className="m-1.25"
             dangerouslySetInnerHTML={{ __html: text }} //forcing rendering HTML
             ></p>
        </div>
      )}
    </div>
  );
};

export default TooltipIcon;
