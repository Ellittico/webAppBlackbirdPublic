type Scope = "local" | "global";

type ScopeToggleProps = {
  value: Scope;
  onChange: (value: Scope) => void;
};

export default function ScopeToggle({ value, onChange }: ScopeToggleProps) {
  const isGlobal = value === "global";

  return (
    <div className="flex items-center gap-3">

      {/* TOGGLE */}
      <button
        type="button"
        onClick={() => onChange(isGlobal ? "local" : "global")}
        className={`
          relative w-10.5 h-5.5 rounded-full
          transition-colors duration-200
          ${isGlobal ? "bg-[#1D4ED8]" : "bg-gray-500"}
        `}
      >
        <span
          className={`
            absolute top-px left-0.5
            w-[20px] h-[20px] rounded-full bg-[#618deb]
            transition-transform duration-200
            ${isGlobal ? "translate-x-5" : ""}
          `}
        />
      </button>
            {/* LABEL  */}
      <span
        className={`text-[0.8rem] font-medium transition-colors text-gray-200
        `}
      >
        {isGlobal ? "Globale" : "Locale"}
      </span>
    </div>
  );
}
