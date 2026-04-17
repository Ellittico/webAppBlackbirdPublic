import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { FaChevronDown, FaChevronUp} from "react-icons/fa";
import LogAppCard from "../components-single/card/LogAppCard";
import type { RootState } from "../store";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "../utlis/useIsMobile";


export function LogPage() {
  const isMobile = useIsMobile(1000)
  const { t } = useTranslation()
  const tenantAgents = useSelector(
    (state: RootState) => state.tenant.agents
  );
  const linesByOrigin = useSelector(
    (state: RootState) => state.log.linesByOrigin
  );
  const logOrigins = useSelector((state: RootState) => state.log.origins);

  const [selectedOriginKey, setSelectedOriginKey] = useState<string | null>(
    null
  );
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const workspaceAgentsRef = useRef<HTMLDivElement | null>(null);
  const [showWorkspaceAgents, setShowWorkspaceAgents] = useState(false);



  useEffect(() => {
    if (!showWorkspaceAgents) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (workspaceAgentsRef.current?.contains(target)) return;
      setShowWorkspaceAgents(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showWorkspaceAgents]);

  const parseLogTimestamp = (line?: string) => {
    if (!line) return null;
    const match = line.match(
      /\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\]/
    );
    if (!match) return null;
    const d = new Date(match[1].replace(" ", "T"));
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const originOptions = useMemo(() => {
    const agentNameById = new Map(
      (tenantAgents ?? []).map((agent) => [
        agent.agent_uuid,
        agent.agent_name,
      ])
    );
    return Object.keys(linesByOrigin).map((originKey) => {
      const origin = logOrigins[originKey];
      const agentUuid = origin?.agent_uuid ?? originKey;
      const label = agentNameById.get(agentUuid) ?? agentUuid;
      return { label, value: originKey, agent_uuid: agentUuid };
    });
  }, [linesByOrigin, logOrigins, tenantAgents]);


  useEffect(() => {
    if (
      selectedOriginKey &&
      originOptions.some((o) => o.value === selectedOriginKey)
    ) {
      return;
    }
    if (originOptions.length === 0) {
      setSelectedOriginKey(null);
      return;
    }
    setSelectedOriginKey(originOptions[0].value);
  }, [originOptions, selectedOriginKey]);

  const selectedLines = selectedOriginKey
    ? linesByOrigin[selectedOriginKey] ?? []
    : [];

  const displayLines = useMemo(() => {
    return selectedLines
      .map((line, idx) => {
        const ts = parseLogTimestamp(line);
        return {
          line,
          idx,
          ts: ts ? ts.getTime() : null,
        };
      })
      .sort((a, b) => {
        if (a.ts !== null && b.ts !== null) {
          if (a.ts !== b.ts) return a.ts - b.ts;
          return a.idx - b.idx;
        }
        if (a.ts === null && b.ts === null) return a.idx - b.idx;
        return a.idx - b.idx;
      })
      .map((item) => item.line);
  }, [selectedLines]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayLines]);

  const getLogColorClass = (line: string) => {
    if (line.includes("[TRACE]")) {
      return "text-gray-400 text-left text-[0.8rem]";
    }
    if (line.includes("[DEBUG]")) {
      return "text-cyan-400 text-left text-[0.8rem]";
    }
    if (line.includes("[INFO]")) {
      return "text-blue-400 text-left text-[0.8rem]";
    }
    if (line.includes("[NOTICE]")) {
      return "text-purple-400 text-left text-[0.8rem]";
    }
    if (line.includes("[WARN] ")) {
      return "text-yellow-400 text-left text-[0.8rem]";
    }
    if (line.includes("[ERROR]")) {
      return "text-red-500 text-left text-[0.8rem]";
    }
    if (line.includes("[FATAL] ")) {
      return "text-red-700 font-bold text-left text-[0.8rem]";
    }
    if (line.includes("[SUCCESS] ")) {
      return "text-green-400 font-bold text-left text-[0.8rem]";
    }
    return "text-white text-left text-[0.8rem]";
  };

  return (
    <div className={` ${isMobile ? "w-[100vw] px-2" : "w-full max-w-[calc(100vw-44px)] "} h-[calc(100vh-80px)] dark:bg-[#2d2d2d] bg-white overflow-hidden `}>
      <div className={`h-max min-h-[85vh] ${isMobile && "max-h-[calc(100%)] w-full flex-1"} overflow-y-hidden`}>
        <p className="module-title fzen text-left flex flex-row align-center">
         {t("log.title")}
        </p>
        <div className={`flex ${isMobile ? "flex-col  h-[calc(100vh-80px)] w-full" : "flex-row  h-full"} pb-4 pr-2`}>

          <div className={`flex flex-col mt-2 ${isMobile ? "" : "max-w-75"}`}>
            <div className="flex flex-col px-6  mx-3">
              <p className="text-[#112189] dark:text-gray-200 text-[0.8rem] text-left">
                 {t("log.selectAgent")}
              </p>
              <select
                className="bg-[#e0f0fd] dark:bg-[#1e1e1e] text-[#112189] dark:text-gray-200 text-sm px-3 py-1.5 rounded-md border border-[#c7d7f5] dark:border-[#2e2e2e]
                          focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] hover:border-[#3b82f6]
                          transition-colors cursor-pointer disabled:bg-[#474747] w-50 truncate"
                value={selectedOriginKey ?? ""}
                onChange={(e) => {
                  setSelectedOriginKey(e.target.value);
                }}
                disabled={originOptions.length === 0}
              >
                {originOptions.length === 0 ? (
                  <option value="" disabled>
                    {t("log.noActivity")}
                  </option>
                ) : (
                  originOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div
              ref={workspaceAgentsRef}
              className={`relative flex flex-col items-center bg-[#e6efff] dark:bg-[#3b3b3b] max-h-[70vh] w-max mx-4 my-2 text-[0.8rem] rounded-md ${isMobile ? "overflow-visible" : "overflow-y-auto"} gap-1 p-1`}
            >
              {isMobile ? (
                <>
                  <button
                    type="button"
                    onClick={() => setShowWorkspaceAgents(v => !v)}
                    className={`w-[266px] flex flex-row items-center justify-between px-2  text-[#112189] dark:text-gray-200 p-1 ${isMobile && "m-auto"}`}
                  >
                    <span>{t("log.workspaceAgents")}</span>
                    {showWorkspaceAgents ? <FaChevronUp/> : <FaChevronDown/>}
                  </button>
                  {showWorkspaceAgents && (
                    <div className="absolute left-0 top-[42px] z-40 w-[274px] max-h-[50vh] overflow-y-auto flex flex-col gap-1 bg-[#e6efff] dark:bg-[#3b3b3b] rounded-md shadow-lg p-2">
                      {tenantAgents &&
                        tenantAgents.map((t) => {
                          return (
                            <LogAppCard
                              key={t.agent_uuid}
                              agent={t}

                              isCurrentAgent={false}
                            />
                          );
                        })}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <p className="text-left w-full px-2 pb-2 min-w-60 text-[#112189] dark:text-gray-200">
                   {t("log.workspaceAgents")}
                  </p>
                  {tenantAgents &&
                    tenantAgents.map((t) => {
                      return (
                        <LogAppCard
                          key={t.agent_uuid}
                          agent={t}

                          isCurrentAgent={false}
                        />
                      );
                    })}
                </>
              )}
            </div>
          </div>

          <div className={`flex flex-col bg-[#1e1e1e] rounded-sm px-2 w-full overflow-y-auto h-[80vh] }`}>
            <div
              className={`flex-1 overflow-y-auto mainApp-scroll text-[0.75rem] text-gray-200 font-mono py-2 text-left `}>
              {displayLines.length === 0 ? (
                <div className="text-gray-400"> {t("log.noLogs")}</div>
              ) : (
                displayLines.map((line, idx) => (
                  <div
                    key={`${selectedOriginKey ?? "log"}-${idx}`}
                    className={`whitespace-pre-wrap ${getLogColorClass(line)}`}
                  >
                    {line}
                  </div>
                ))
              )}
              <div ref={bottomRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
