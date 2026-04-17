import { useEffect, useRef, useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

/* =======================
   TIPI
======================= */

export type SelectOption<T extends string> = {
  label: string;
  value: T;
};

interface CustomSelectProps<T extends string> {
  options: readonly SelectOption<T>[];
  defaultValue: T;
  value?: T;                 // 👈 NUOVO (opzionale)
  onChange?: (value: T) => void;
  Isdisabled?: boolean;
  isPreset?: boolean;
}


/* =======================
   COMPONENTE
======================= */

export default function CustomSelect<T extends string>({
  options,
  value,
  defaultValue,
  onChange,
  Isdisabled = false,
  isPreset = false,
}: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<T>(defaultValue);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  /* =======================
     CLICK OUTSIDE
  ======================= */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* =======================
     SELEZIONE
  ======================= */
  const handleSelect = (value: T) => {
    setSelected(value);
    setIsOpen(false);
    onChange?.(value);
  };

  const selectedLabel =
    options.find((o) => o.value === selected)?.label ?? "";

  //Solo se c'è value --> quindi se c'è default
  useEffect(() => {
    if (value !== undefined) {
      setSelected(value);
    }
  }, [value]);

  /* =======================
     RENDER
  ======================= */
  return (
    <div ref={wrapperRef} className="relative w-50 text-white text-sm">
      {/* HEADER */}
      <div
        className={`
          h-[35px] w-full
          dark:text-white text-[#112189]
          bg-[#e0f0fd] dark:bg-[#1E1E1E]
          border-0 border-b border-[#3559BE]
          px-3 py-2
          flex items-center justify-between
          cursor-pointer text-[0.75rem]
          truncate 
          ${Isdisabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
        onClick={() => !Isdisabled && setIsOpen((o) => !o)}
      >
        <span className="truncate max-w-[85%]">{selectedLabel}</span>
        <FaChevronDown className="relative right-2.5 text-[#3355B4] text-xs" />
      </div>

      {/* DROPDOWN */}
      {isOpen && !Isdisabled && (
        <ul className="list-none absolute z-50 w-full bg-[#c1d9fd] dark:bg-[#1E1E1E] mt-0 pl-0 text-[0.75rem] text-[#1D4ED8] dark:text-white">
          {options.map((opt) => (
            <li
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              className={`
                w-50 flex items-center justify-center
                pl-0 pr-0 py-2
                border-b border-[#5773b0]
                hover:bg-[#1D4ED8] hover:text-white
                hover:dark:bg-[#1A2337]
                cursor-pointer h-8.75
                ${
                  selected === opt.value
                    ? "dark:bg-[#1D4ED8] bg-[#3e5bff] text-white"
                    : ""
                }
              `}
            >
              <p className="pl-2.5 w-full text-[0.75rem] truncate text-gray-300">
                &nbsp;&nbsp;&nbsp;{opt.label}&nbsp;&nbsp;&nbsp;
              </p>
            </li>
          ))}

          {isPreset && (
            <li
              onClick={() => navigate("/netscan/preset")}
              className="
                w-50 flex items-center justify-center
                pl-0 pr-0 py-2
                border-b border-[#5773b0]
                hover:bg-[#1D4ED8] hover:text-white
                hover:dark:bg-[#1A2337]
                cursor-pointer h-8.75
              "
            >
              <p className="pl-2.5 w-full text-[0.75rem]">
                &nbsp;&nbsp;&nbsp;{t("scanLan.scanTypeOptions.createPreset")}
              </p>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
