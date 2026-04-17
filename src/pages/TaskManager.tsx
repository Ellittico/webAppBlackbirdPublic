import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { uiGetTask } from "../ws/message/task/task.message";
import { FaChevronDown, FaChevronUp, FaSquare } from "react-icons/fa";
import logoApp from "../assets/logo/logoAppbgwhite.ico"

import type { RootState } from "../store";
import { sendMessage } from "../ws/tenantSocket";
import type { TaskItem, TaskType } from "../types/task.type";
import LoadingSpinner from "../components-single/resusable/miscellaneous/LoadingSpinner";
import { uiStopScanMessage } from "../ws/message/scan/startScan";
import type { WsOrigin } from "../types/ws.types";
import { useIsMobile } from "../utlis/useIsMobile";
import { useTranslation } from "react-i18next";

type ActiveTaskRowProps = {
  task: TaskItem;
  idx: number;
  showStop: boolean;
  agentsList: RootState["tenant"]["agents"];
  formatDate: (value?: string) => string;
  onTerminate: (taskId: string, taskType: TaskType) => void;
};

function ActiveTaskRow({
  task,
  idx,
  showStop,
  agentsList,
  formatDate,
  onTerminate,
}: ActiveTaskRowProps) {
  const [hasClicked, setHasClicked] = useState(false);

  return (
    <div
      key={task.task_id}
      className={`h-[37px] flex flex-row w-full gap-4 items-center text-center text-[0.8rem] text-[#112189] dark:text-gray-200 ${
        idx % 2 === 0 ? "bg-[#f5f9ff] dark:bg-[#444444]" : "bg-[#e7f0ff] dark:bg-[#3B3B3B]"
      }`}
    >
      <div className=" w-[125px] text-left pl-4 truncate capitalize">{task.task_type}</div>
      <div className="flex-1 truncate">
        {agentsList.find((a) => a.agent_uuid === task.from_agent)?.agent_name ?? task.from_agent}
      </div>
      <div className="w-[141px]">{formatDate(task.created_at)}</div>

      {showStop && (
        <div className="w-[48px] pr-4">
          {hasClicked ? (
            <LoadingSpinner width={9} height={9} />
          ) : (
            <button
              type="button"
              className="bg-red-600 text-white text-xs px-2 py-1 rounded"
              onClick={() => {
                onTerminate(task.task_id, task.task_type);
                setHasClicked(true);
              }}
            >
              <FaSquare />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function TaskManager() {
  const isMobile = useIsMobile(1000)
  const activeTasks = useSelector((state: RootState) => state.task.active);
  const completedTasks = useSelector((state: RootState) => state.task.completed);
  const agents =useSelector((state:RootState)=> state.tenant.agents) 
  const agentsList = agents 
  const [selectedAgentUuid, setSelectedAgentUuid] = useState<string | null>(() => {
    return agentsList?.find((agent) => agent.online)?.agent_uuid ?? null;
  });
  const tenantId = useSelector((state: RootState) => state.tenant.info?.tenant_id);
  const thisAgentUuid = useSelector((state: RootState) => state.tenant.thisAgentUuid);
  const userId = useSelector((state: RootState) => state.auth.userId);
  const workspaceAgentsRef = useRef<HTMLDivElement | null>(null);
  const [showWorkspaceAgents, setShowWorkspaceAgents] = useState(false);
  const [openActiveTaskId, setOpenActiveTaskId] = useState<string | null>(null);
  const [openCompletedTaskId, setOpenCompletedTaskId] = useState<string | null>(null);
  const origin = useMemo<WsOrigin | null>(() => {
      if (!thisAgentUuid || !userId || !tenantId) return null;
      return {
          agent_uuid: thisAgentUuid,
          user_uuid: userId,
          tenant_uuid: tenantId,
          source: "ui",
      };
  }, [thisAgentUuid, userId, tenantId]);
      
  useEffect(() => {
   
    const sendTaskRequest = () => {

      if(!selectedAgentUuid) return
      const msg = uiGetTask(selectedAgentUuid);
      sendMessage(msg)
    };

    sendTaskRequest();
    const intervalId = window.setInterval(sendTaskRequest,5000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

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

  const formatDate = (value?: string) => {
    if (!value) return "-";
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
  };

  const getCreatedAtTime = (value?: string) => {
    const time = Date.parse(value ?? "");
    return Number.isNaN(time) ? 0 : time;
  };

  const sortedActiveTasks = [...activeTasks].sort(
    (a, b) => getCreatedAtTime(a.created_at) - getCreatedAtTime(b.created_at)
  );
  const sortedCompletedTasks = [...completedTasks].sort(
    (a, b) => getCreatedAtTime(a.created_at) - getCreatedAtTime(b.created_at)
  );

  const agentOptions = useMemo(
    () =>
      (agentsList ?? [])
        .filter((agent) => agent.online)
        .map((agent) => ({
          label: agent.agent_name,
          value: agent.agent_uuid,
        })),
    [agentsList]
  );

  useEffect(() => {
    if (selectedAgentUuid && agentOptions.some((o) => o.value === selectedAgentUuid)) {
      return;
    }
    if (agentOptions.length === 0) {
      setSelectedAgentUuid(null);
      return;
    }
    setSelectedAgentUuid(agentOptions[0].value);
  }, [agentOptions, selectedAgentUuid]);

  const filteredActiveTasks = useMemo(() => {
    if (!selectedAgentUuid) return sortedActiveTasks;
    return sortedActiveTasks.filter((task) => task.from_agent === selectedAgentUuid);
  }, [sortedActiveTasks, selectedAgentUuid]);

  const filteredCompletedTasks = useMemo(() => {
    if (!selectedAgentUuid) return sortedCompletedTasks;
    return sortedCompletedTasks.filter((task) => task.from_agent === selectedAgentUuid);
  }, [sortedCompletedTasks, selectedAgentUuid]);

  const handleTerminationTask = (task_id:string,task_type:TaskType) =>{
    if(!origin||!selectedAgentUuid) return
    switch(task_type){
            case "lanscan":
                sendMessage(uiStopScanMessage(task_id,origin,selectedAgentUuid))
                //console.log("stoppata")
                break;
            
            default:
                break;
    }
  }
  const { t } = useTranslation()

  return (
    <div className={`min-h-screen ${isMobile ? "w-[100vw] ": "w-[calc(100%)]"} dark:bg-[#2b2b2b] bg-white `}>
      <div className="w-full h-[calc(100vh-65px)] pb-4">
        <div className="flex flex-col w-max items-start ml-8 ">
            <p className="module-title fzen">{t("task_manager.title")} </p>
            <p className="text-[0.85rem] mt-1.5 ml-2 text-gray-400">
              {t("task_manager.subtitle")} 
            </p>
        </div>

        <div className={`mt-2 flex ${isMobile ? "flex-col" : "flex-row"} h-full pb-4 pr-2`}>

            <div className={`flex flex-col mt-2 ${isMobile ? "" : "max-w-75"}`}>
              <div className="flex flex-col px-6  mx-3">
                <p className="text-[#112189] dark:text-gray-200 text-[0.8rem] text-left">
                  {t("task_manager.select_agent")} 
                </p>
                <select
                  className="bg-[#e0f0fd] dark:bg-[#1e1e1e] text-[#112189] dark:text-gray-200 text-sm px-3 py-1.5 rounded-md border border-[#c7d7f5] dark:border-[#2e2e2e]
                          focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] hover:border-[#3b82f6]
                          transition-colors cursor-pointer disabled:bg-[#474747]"
                  value={selectedAgentUuid ?? ""}
                  onChange={(e) => {
                    setSelectedAgentUuid(e.target.value);
                  }}
                  disabled={agentOptions.length === 0}
                >
                  {agentOptions.length === 0 ? (
                    <option value="" disabled>
                     {t("task_manager.no_agents")} 
                    </option>
                  ) : (
                    agentOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div
                ref={workspaceAgentsRef}
                className={`relative flex flex-col items-center bg-[#e6efff] dark:bg-[#3b3b3b] max-h-[70vh] w-65 mx-4 my-2 text-[0.8rem] rounded-md ${isMobile ? "overflow-visible" : "overflow-y-auto"} gap-1 p-1`}
              >
                {isMobile ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowWorkspaceAgents(v => !v)}
                      className="w-[266px] flex flex-row items-center justify-between px-2  text-[#112189] dark:text-gray-200 p-1"
                    >
                      <span>  {t("task_manager.workspace_agents")} </span>
                      {showWorkspaceAgents ? <FaChevronUp/> : <FaChevronDown/>}
                    </button>
                    {showWorkspaceAgents && (
                      <div className="absolute left-0 top-[42px] z-40 w-[274px] max-h-[50vh] overflow-y-auto flex flex-col gap-1 bg-[#e6efff] dark:bg-[#3b3b3b] rounded-md shadow-lg p-2">
                        {(agentsList ?? []).map((agent) => {
                          const isSelected = selectedAgentUuid === agent.agent_uuid;
                          return (
                            <div
                              key={agent.agent_uuid}
                              className={`w-[250px] bg-[#e6efff] dark:bg-[#2e2e2e] py-1 rounded-sm flex flex-row items-center gap-2 px-2 border ${
                                isSelected ? "border-blue-500" : "border-transparent"
                              }`}
                            >
                              <span
                                className={`h-2 w-2 rounded-full ${
                                  agent.online ? "bg-green-500" : "bg-red-500"
                                }`}
                              />
                              <span className="max-w-48 truncate text-[#112189] dark:text-white">
                                {agent.agent_name}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-left w-full px-2 pb-2 min-w-60 text-[#112189] dark:text-gray-200">
                      {t("task_manager.workspace_agents")}
                    </p>
                    {(agentsList ?? []).map((agent) => {
                      const isSelected = selectedAgentUuid === agent.agent_uuid;
                      return (
                        <div
                          key={agent.agent_uuid}
                          className={`w-[250px] bg-[#e6efff] dark:bg-[#2e2e2e] py-1 rounded-sm flex flex-row items-center gap-2 px-2 border ${
                            isSelected ? "border-blue-500" : "border-transparent"
                          }`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${
                              agent.online ? "bg-green-500" : "bg-red-500"
                            }`}
                          />
                          <span className="max-w-48 truncate text-[#112189] dark:text-white">
                            {agent.agent_name}
                          </span>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </div>
          <div className="flex-1">
            <p className="text-[#112189] dark:text-blue-200 font-semibold text-left px-10 text-[0.8rem]">
               {t("task_manager.active_tasks")} -{" "}
              <span className="text-[#1D4ED8] dark:text-blue-500">
                {filteredActiveTasks.length}
              </span>
            </p>
            <section className="w-[95%] mx-auto dark:bg-[#3F3F3F] h-[30vh] min-h-52.5 overflow-hidden rounded-[5px] flex flex-col">
              <div className="w-full text-[darkblue] dark:text-white text-sm border-t-0 bg-slate-400 dark:bg-[#1E1E1E] text-[0.9rem] flex flex-col h-full min-h-0">
                <div className="flex flex-row gap-4 items-center text-center w-full h-[27px] text-[0.8rem] bg-[#1d4ed8] dark:bg-[#1E1E1E] text-white">
                  <div className="w-[125px] text-left pl-4">{t("task_manager.table.type")}</div>
                  {!isMobile && (
                    <>
                      <div className="flex-1">{t("task_manager.table.from_agent")}</div>
                      <div className="w-[141px]">{t("task_manager.table.created_at")}</div>
                    </>
                  )}
                  <div className="w-[48px] pr-4"></div>
                </div>
                <div className="flex-1 min-h-0 overflow-y-auto mainApp-scroll">
                  {filteredActiveTasks.length === 0 ? (
                    <div className=" flex flex-1 flex-col-reverse w-full gap-4 my-auto items-center bg-white dark:bg-[#3F3F3F] text-center h-full">
                      <div className="flex-1 text-[#112189] dark:text-blue-300 font-semibold flex flex-col">
                             {t("task_manager.no_tasks_active")}
                            <span className="text-gray-200 font-thin text-[0.75rem]"> {t("task_manager.start_task_prompt")}</span>
                        </div>
                        <img src={logoApp} alt="Logo" className="h-16 w-16 opacity-70 mt-4" />
                    </div>
                  ) : (
                    filteredActiveTasks.map((task, idx) => {
                      if (!isMobile) {
                        return (
                          <ActiveTaskRow
                            key={task.task_id}
                            task={task}
                            idx={idx}
                            showStop
                            agentsList={agentsList}
                            formatDate={formatDate}
                            onTerminate={handleTerminationTask}
                          />
                        );
                      }

                      const isOpen = openActiveTaskId === task.task_id;
                      const owner =
                        agentsList.find((a) => a.agent_uuid === task.from_agent)?.agent_name ??
                        task.from_agent;

                      return (
                        <div key={task.task_id} className="w-full">
                          <div
                            className={`h-[37px] flex flex-row w-full gap-4 items-center text-center text-[0.8rem] text-[#112189] dark:text-gray-200 ${
                              idx % 2 === 0 ? "bg-[#f5f9ff] dark:bg-[#444444]" : "bg-[#e7f0ff] dark:bg-[#3B3B3B]"
                            }`}
                            onClick={() =>
                              setOpenActiveTaskId(isOpen ? null : task.task_id)
                            }
                          >
                            <div className="flex-1 text-left pl-4 truncate capitalize">
                              {task.task_type}
                            </div>
                            <div
                              className="w-[48px] pr-4"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                className="bg-red-600 text-white text-xs px-2 py-1 rounded"
                                onClick={() =>
                                  handleTerminationTask(task.task_id, task.task_type)
                                }
                              >
                                <FaSquare />
                              </button>
                            </div>
                          </div>
                          {isOpen && (
                            <div className="bg-[#eef4ff] dark:bg-[#2f2f2f] text-[0.75rem] text-left px-4 py-2">
                              <div className="flex flex-row justify-between">
                                <span className="text-gray-500">{t("task_manager.table.owner")}</span>
                                <span className="text-gray-800 dark:text-gray-200 truncate max-w-[60%]">
                                  {owner}
                                </span>
                              </div>
                              <div className="flex flex-row justify-between">
                                <span className="text-gray-500">{t("task_manager.table.created_at")}</span>
                                <span className="text-gray-800 dark:text-gray-200">
                                  {formatDate(task.created_at)}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </section>
            <p className="mt-2 text-[#112189] dark:text-blue-200 font-semibold text-left px-10 text-[0.8rem]">
              {t("task_manager.completed_tasks")} -{" "}
              <span className="text-[#1D4ED8] dark:text-blue-500">
                {filteredCompletedTasks.length}
              </span>
            </p>
            <section className="w-[95%] mx-auto dark:bg-[#3F3F3F] h-[40vh] min-h-52.5 overflow-hidden rounded-[5px] flex flex-col">
              <div className="w-full text-[darkblue] dark:text-white text-sm border-t-0 bg-slate-400 dark:bg-[#1E1E1E] text-[0.9rem] flex flex-col h-full min-h-0">
                <div className="flex flex-row gap-4 items-center text-center w-full h-[27px] text-[0.8rem] bg-[#1d4ed8] dark:bg-[#1E1E1E] text-white">
                  <div className="w-[125px] text-left pl-4"> {t("task_manager.table.type")}</div>
                  <div className=" flex-1">{t("task_manager.table.owner")}</div>
                  {!isMobile && (
                    <>
                      <div className="w-[141px]">{t("task_manager.table.created_at")}:</div>
                      <div className="w-[141px] pr-4">{t("task_manager.table.finished_at")}:</div>
                    </>
                  )}
                  {isMobile && <div className="w-[141px] pr-4">{t("task_manager.table.finished_at")}:</div>}
                </div>
                <div className="flex-1 min-h-0 overflow-y-auto mainApp-scroll">
                  {filteredCompletedTasks.length === 0 ? (
                    <div className=" flex flex-1 flex-col-reverse w-full gap-4 my-auto items-center bg-white dark:bg-[#3F3F3F] text-center h-full">
                      <div className="flex-1 text-[#112189] dark:text-blue-300 font-semibold flex flex-col">
                            {t("task_manager.no_tasks_completed")}
                            <span className="text-gray-200 font-thin text-[0.75rem]">{t("task_manager.start_task_prompt")}</span>
                        </div>
                        <img src={logoApp} alt="Logo" className="h-16 w-16 opacity-70 mt-4" />
                    </div>
                  ) : (
                    filteredCompletedTasks.map((task, idx) => {
                      const owner =
                        agentsList.find(a => a.agent_uuid === task.from_agent)?.agent_name ??
                        task.from_agent;
                      if (!isMobile) {
                        return (
                          <div
                            key={task.task_id}
                            className={`h-[37px] flex flex-row w-full gap-4 items-center text-center text-[0.8rem] text-[#112189] dark:text-gray-200 ${
                              idx % 2 === 0 ? "bg-[#e7f0ff] dark:bg-[#3B3B3B]" : "bg-[#f5f9ff] dark:bg-[#444444]"
                            }`}
                          >
                            <div className="w-[125px] text-left pl-4 truncate capitalize">{task.task_type}</div>
                            <div className="flex-1">
                              {owner}
                            </div>
                            <div className="w-[141px]">{formatDate(task.created_at)}</div>
                            <div className="w-[141px] pr-4">{formatDate(task.updated_at)}</div>
                          </div>
                        );
                      }

                      const isOpen = openCompletedTaskId === task.task_id;

                      return (
                        <div key={task.task_id} className="w-full">
                          <div
                            className={`h-[37px] flex flex-row w-full gap-4 items-center text-center text-[0.8rem] text-[#112189] dark:text-gray-200 ${
                              idx % 2 === 0 ? "bg-[#e7f0ff] dark:bg-[#3B3B3B]" : "bg-[#f5f9ff] dark:bg-[#444444]"
                            }`}
                            onClick={() =>
                              setOpenCompletedTaskId(isOpen ? null : task.task_id)
                            }
                          >
                            <div className="flex-1 text-left pl-4 truncate">
                              {owner}
                            </div>
                            <div className="w-[141px] pr-4">
                              {formatDate(task.updated_at)}
                            </div>
                          </div>
                          {isOpen && (
                            <div className="bg-[#eef4ff] dark:bg-[#2f2f2f] text-[0.75rem] text-left px-4 py-2">
                              <div className="flex flex-row justify-between">
                                <span className="text-gray-500">{t("task_manager.table.type")}</span>
                                <span className="text-gray-800 dark:text-gray-200 truncate max-w-[60%] capitalize">
                                  {task.task_type}
                                </span>
                              </div>
                              <div className="flex flex-row justify-between">
                                <span className="text-gray-500">{t("task_manager.table.created_at")}</span>
                                <span className="text-gray-800 dark:text-gray-200">
                                  {formatDate(task.created_at)}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
