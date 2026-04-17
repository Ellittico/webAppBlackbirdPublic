import React, { useEffect, useMemo, useRef, useState } from "react";
import '../styles/App.css';
import { useDispatch, useSelector } from "react-redux";


//ICONS
import { FaQuestionCircle,FaPlay,FaSquare, FaChevronDown} from 'react-icons/fa';


//COMPONENTS
import CustomSelect from "../components-single/resusable/selector/SelectWithArrow";
import TooltipIcon from "../components-single/resusable/miscellaneous/TooltipIcon";
import LoadingSpinner from "../components-single/resusable/miscellaneous/LoadingSpinner";

//COSTANT
import { toolTipInfo } from "../utlis/HelpToolTipContext ";
import {usePortRisk} from "../utlis/usePortRisk"
import { useTranslation } from "react-i18next";

import {handleCorrect, handleTargetSubnet, handleTerminationScan, startScanWithTarget} from "../controls/ScanLanControls";
import type {  ScanLanHost, ScanOutputFormat, ScanTypes } from "../types/scan.type";
import type { RootState } from "../store";
import PacketScanRow from "../components-single/PacketScanRow";
import { resetScans, setLastRequestedScan, setScanLocalMeta, setScanOutputFormat } from "../feature/scan/scanSlice";
import type { WsOrigin } from "../types/ws.types";
import { useIsMobile } from "../utlis/useIsMobile";
import { defaultPreset } from "../utlis/getDefaultPreset";

const compareByIpAsc = (a: ScanLanHost, b: ScanLanHost) => {
    const toOctets = (ip: string) => {
        const m = ip.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
        if (!m) return [Infinity, Infinity, Infinity, Infinity];
        return m.slice(1).map(n => Number.parseInt(n, 10));
    };

    const A = toOctets(a.IP ?? "");
    const B = toOctets(b.IP ?? "");

    for (let i = 0; i < 4; i += 1) {
        if (A[i] !== B[i]) return A[i] - B[i];
    }
    return 0;
};


const ScanLan: React.FC = () => {
    const buttonStartContainer = useRef<HTMLDivElement>(null);
    const dispatch = useDispatch()

    // --- DATA FROM STORE
    const ipEstimated = useSelector((state: RootState) => state.scan.resolvedTarget?.total_ips_estimated);
    const resolvedTarget = useSelector((state: RootState) => state.scan.resolvedTarget);
    const packetScanStream = useSelector((state: RootState) => state.scan.scans);
    const startedTaskIds = useSelector((state: RootState) => state.scan.startedTaskIds);
    const scanMeta = useSelector((state: RootState) => state.scan.scanMeta);
    const sortedScans = [...packetScanStream].sort(
        (a, b) => (b.lastUpdated ?? 0) - (a.lastUpdated ?? 0)
    );

    //globale almeno una è attiva --> true
    const isRunning = useSelector((state: RootState) => state.scan.scans.some(scan => !scan.completata));
    
    //Origin infos
    const tenantId = useSelector((state: RootState) => state.tenant.info?.tenant_id)
    const thisAgentUuid = useSelector((state: RootState) => state.tenant.thisAgentUuid)
    const userId = useSelector((state: RootState) => state.auth.userId)

    //agents
    const agents = useSelector((state: RootState) => state.tenant.agents)
    const onlineAgents = agents.filter(agent => agent.online)
    const agentOptions = onlineAgents.map((agent: { agent_name: string; agent_uuid: string; }) => ({
        label: agent.agent_name,
        value: agent.agent_uuid,
    }));
    const agentNameById = useMemo(() => new Map(
        (agents ?? []).map(agent => [agent.agent_uuid, agent.agent_name])
    ), [agents]);


    const [selectedAgent, setSelectedAgent] = useState<string>("")
        
    // --- USESTATE 
    //const scope = useState<"local" | "global">("local")
    const [inputValue, setInputValue] = useState("");
    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    const [isAutocorrected, setisAutocorrected] = useState<boolean | null>(false);
    const [format,setFormat]= useState<ScanOutputFormat>("onlyscreen")
    const [scaType,setScanTYpe] = useState<ScanTypes>("complete")
    const { getPortRisk } = usePortRisk();
    const [infoNotifiche, setInfoNotifiche] = useState<string | null>(null)
    const [isClosingNotice, setIsClosingNotice] = useState(false)
    
    const { t } = useTranslation();

    const startTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const startedTaskIdsRef = useRef(startedTaskIds)
    const startedCountBeforeRef = useRef(0)
    const startPendingRef = useRef(false)
    const lanTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const pendingLanRequestRef = useRef(false)

    const agentOptionsWithDefault = useMemo(() => [
    {
        label: t("scanLan.select"), // oppure "Seleziona agente"
        value: "",
    },
    ...agentOptions,
    ], [agentOptions, t])

    //calcolo origin
    const origin = useMemo<WsOrigin | null>(() => {
        if (!thisAgentUuid || !userId || !tenantId) return null
        return {
            agent_uuid: thisAgentUuid,
            user_uuid: userId,
            tenant_uuid: tenantId,
            source: "ui",
        }
    }, [thisAgentUuid, userId, tenantId])

    const clearLanRequestTimeout = () => {
        pendingLanRequestRef.current = false
        if (lanTimeoutRef.current) {
            clearTimeout(lanTimeoutRef.current)
            lanTimeoutRef.current = null
        }
    }

    const startLanRequestTimeout = () => {
        pendingLanRequestRef.current = true
        if (lanTimeoutRef.current) {
            clearTimeout(lanTimeoutRef.current)
        }
        lanTimeoutRef.current = setTimeout(() => {
            if (pendingLanRequestRef.current) {
                setInfoNotifiche(t("scanLan.agentOffline"))
            }
        }, 3000)
    }

    //Invio risoluzione target
    useEffect(() => {       
        if (!selectedAgent || !origin) return;       
        startLanRequestTimeout()
        handleTargetSubnet("lan_current", selectedAgent, origin)
    }, [selectedAgent, origin]);

   
    //inizializazzione agenti
    useEffect(() => {
    if (!selectedAgent) return

    const exists = agentOptions.some(
        opt => opt.value === selectedAgent
    )

    if (!exists) {
        setSelectedAgent("")
    }
    }, [agentOptions, selectedAgent])

    //Cambio valore input target e autocorrection
    useEffect(() => {
    if (!resolvedTarget) return;

    const label = resolvedTarget.previews
        .map(p => p.label)
        .join(", ");

    setInputValue(label);
    setisAutocorrected(true);
    if (pendingLanRequestRef.current) {
        clearLanRequestTimeout()
    }
    }, [resolvedTarget]);

    useEffect(() => {
        if (packetScanStream.length > 0) {
            clearLanRequestTimeout()
            if (startPendingRef.current) {
                clearStartTimeout()
            }
        }
    }, [packetScanStream.length])

    useEffect(() => {
        if (Object.keys(startedTaskIds).length > 0) {
            clearLanRequestTimeout()
        }
    }, [startedTaskIds])

    const clearStartTimeout = () => {
        startPendingRef.current = false
        if (startTimeoutRef.current) {
            clearTimeout(startTimeoutRef.current)
            startTimeoutRef.current = null
        }
    }

    useEffect(() => {
        startedTaskIdsRef.current = startedTaskIds
        if (startPendingRef.current) {
            const currentCount = Object.keys(startedTaskIds).length
            if (currentCount > startedCountBeforeRef.current) {
                clearStartTimeout()
            }
        }
    }, [startedTaskIds])

    useEffect(() => {
        if (!infoNotifiche) return

        const closeTimer = setTimeout(() => {
            setIsClosingNotice(true)
        }, 2500)

        const removeTimer = setTimeout(() => {
            setInfoNotifiche(null)
            setIsClosingNotice(false)
        }, 3000)

        return () => {
            clearTimeout(closeTimer)
            clearTimeout(removeTimer)
        }
    }, [infoNotifiche])

    useEffect(() => {
        return () => {
            if (startTimeoutRef.current) {
                clearTimeout(startTimeoutRef.current)
            }
            if (lanTimeoutRef.current) {
                clearTimeout(lanTimeoutRef.current)
            }
        }
    }, [])

    const handleScrollDown = () => {
        const container = document.querySelector(".main") as HTMLElement | null
        const delta = window.innerHeight
        if (container) {
        container.scrollBy({ top: delta, behavior: "smooth" })
        return
        }
        window.scrollBy({ top: delta, behavior: "smooth" })
    }
    const  handleAvviaScansione = async () => {
     
      //controllo input
      const rawInput = inputValue.trim();
      if (!rawInput) {
        return;
      }
    
      // invio correzione per sicurezza
      /*const response = await sendMessageWithResponse<{
        payload: ResolvedTarget;
      }>(uiCorrectTargetIp(rawInput));
      console.log("[ScanLan] corrected target response", response);*/
    
      //controllo risposta
      /*const corrected = response.payload.previews.map(p => p.label).join(", ");
      if (!corrected) {
        console.error("Target non valido");
        return;
      }*/

      const corrected = rawInput

      //se tutto ok parte la scan
      const task_id = crypto.randomUUID()
     
      dispatch(setScanOutputFormat({task_id,format}))
      dispatch(setScanLocalMeta({ task_id, target: corrected, startedAt: Date.now() }))
      dispatch(setLastRequestedScan({ format, target: corrected }))

      if(!selectedAgent||!origin) return
        startPendingRef.current = true
        startedCountBeforeRef.current = Object.keys(startedTaskIdsRef.current).length
        if (startTimeoutRef.current) {
            clearTimeout(startTimeoutRef.current)
        }
        startTimeoutRef.current = setTimeout(() => {
            if (!startPendingRef.current) return
            const currentCount = Object.keys(startedTaskIdsRef.current).length
            if (currentCount > startedCountBeforeRef.current) {
                clearStartTimeout()
                return
            }
            setInfoNotifiche(t("scanLan.agentOffline"))
        }, 3000)


        const getDefaultPresetForType = (type: ScanTypes) => {
            switch (type) {
            case "quick":
                return defaultPreset.quick;
            case "deep":
                return defaultPreset.deep;
            case "complete":
                return defaultPreset.complete;
            default:
                return defaultPreset.complete;
            }
        };

        const effectivePreset =  getDefaultPresetForType(scaType);

        startScanWithTarget(
            selectedAgent,
            origin,
            corrected,
            format,
            effectivePreset
        );
    };

    const toggleRow = (key: string) => {
        setExpandedRow(prev => (prev === key ? null : key));
    };

    const isMobile = useIsMobile(1000)

    return(
        <div className={`main dark:bg-[#2b2b2b] bg-white overflow-auto ${isMobile ? "w-[100vw] overflow-x-hidden" : "max-w-[calc(100vw-44px)] h-[calc(100%-45px)]"} pb-2`}>
            {infoNotifiche && (
                <div
                    className={`
                        fixed top-12 left-6 z-50
                        bg-white text-black rounded-md px-4 py-3 shadow-md
                        transition-[opacity,transform] duration-500 ease-in-out text-[0.8rem]
                        ${isClosingNotice ? "opacity-0 translate-y-6" : "opacity-100 translate-y-0"}
                    `}
                >
                    <b>Messaggio:</b> {infoNotifiche}
                </div>
            )}

            <div className=" overflow-auto h-[calc(100%)] max-h-screen mainApp-scroll ">
               {/* /<ProgressBar percentage={progressPerc} isTerminated={!isRunning}  />
                 Title e Start Button */}
                <div className="flex flex-row  justify-between mt-2">
                    <div className={`${isMobile ? "m1-2 ml-1": ""}`}>
                        <div className={`${isMobile ? "ml-2" : "text-[1.2rem] ml-6 pl-2.5 mt-[0.8rem]"} font-medium text-[#618DEB]    fzen  w-max flex flex-row gap-3 `}>
                        {t("scanLan.title")}
                        {/** <div className="w-0 border-r border-[#444]"/>
                        <ScopeToggle
                            value={"local"}
                            onChange={(_) => {}}
                        />*/}
                        </div>
                        <div className="flex flex-row items-center">
                            <p className={`${isMobile ? "ml-2 text-[0.9rem]" : "text-[1.2rem] ml-6 pl-2.5 mt-[0.6rem]"}  text-[0.95rem] flex flex-row gap-2.5 text-[#1D4ED8] dark:text-white`}>
                                {t("scanLan.configuration")}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-row justify-center items-center pr-6 mb-6 text-white">
                        <div
                            ref={buttonStartContainer}
                            className={`pr-[0.7rem] flex flex-row`}
                        >
                        <button
                            onClick={() => dispatch(resetScans())}
                            className="bg-gradient-to-r from-[#6b7280] to-[#374151] rounded-md
                                        w-42.5 px-4 mr-2 flex flex-row gap-3 justify-center py-1.75 items-center
                                        focus:outline-none focus:ring-0
                                        text-white"
                        >
                        <FaSquare size={18} className="text-white" />
                        <span  style={{ display: isMobile ? "none" : "block" }}>{t("scanLan.reset")}</span>
                        </button>
                        <button
                           onClick={()=>{
                                handleAvviaScansione()
                            }}
                            className="bg-gradient-to-r from-[#112189] to-[#1D4ED8] rounded-md
                                        w-42.5 px-4 mr-0 flex flex-row gap-3 justify-center py-1.75 items-center
                                        focus:outline-none focus:ring-0
                                        text-white"
                        >
                        <FaPlay size={20} className="text-white  left-6.25 top-8.25" />
                        <span  style={{ display: isMobile ? "none" : "block" }}
                        >
                            {t("scanLan.start")}
                        </span>
                        </button>
                        </div>
                        
                    </div>
                </div>
                {/* Inputs */}
                <div className={` flex ${isMobile ? "flex-col w-[95vw]" : "flex-row pr-5 w-full"}`}>
                    <div className={`${isMobile ? "w-[95vw] px-[2.5vw]" : "pl-14 w-full"} `}>
                        <label className={`text-[0.75rem] relative font-thin text-left  text-[#162272] dark:text-[#D9D9D9] flex flex-col  mt-2 ${isMobile ? "": "-mx-5  w-full"} `}>
                            <p className="m-0 flex flex-row gap-2">
                                 &nbsp;&nbsp; {t("scanLan.targetIp")} 
                                 {isAutocorrected&& (
                                    <React.Fragment>
                                      - <span className="text-[#f78a31] font-medium dark:text-[#F4C837]">  {t("scanLan.autocorrected")}  </span>
                                    </React.Fragment> 
                                 )}
                                 {ipEstimated !== null && (
                                    <span className="text-xs bg-orange-300 rounded-sm px-2 py-0 text-orange-900 font-semibold">
                                       Estimated: {ipEstimated} IP
                                    </span>
                                )}
                             </p> 
                            <input 
                                  className={`module-input-black ${isMobile ? "" : "min-w-60.5 "}  w-full text-[0.75rem] pr-27`}
                                    placeholder={t("scanLan.NoLanAvalible")}
                                    value={inputValue}
                                    disabled={isRunning}
                                    onChange={(e) => {
                                        setInputValue(e.target.value); 
                                        setisAutocorrected(false); 
                                    }}
                            />
                            <button 
                                className="bg-gradient-to-r absolute -right-3 top-[19px] from-[#112189] ml-4 py-1 to-[#2460fa] border-0 focus:outline-none focus:ring-0 text-[0.8rem] w-max px-4 rounded-[5px] text-white mr-[1.2rem]" 
                                onClick={()=>{
                                    handleCorrect(inputValue);
                                }}
                                disabled={isRunning}
                            >
                                 {t("scanLan.fix")}
                            </button>
                        </label>
                     
                        <div className={`flex flex-row items-end justify-between ${isMobile ? " " : "ml-[-1.2rem]"}  mt-[18px] `}>
                            <label className="module-label-input mt-3.75 text-left w-[180px]">
                                &nbsp;&nbsp; {t("scanLan.targetSubnet")}
                                <CustomSelect
                                    options={[
                                        { label: t("scanLan.targetSubnetOptions.allActiveLan"), value: "lan_all" },
                                        { label: t("scanLan.targetSubnetOptions.currentLan"), value: "lan_current" },
                                    ]}
                                    defaultValue="lan_current"
                                    Isdisabled={false}
                                   onChange={(v) => {
                                        setisAutocorrected(false);
                                        if (!selectedAgent || !origin) return
                                        startLanRequestTimeout()
                                        handleTargetSubnet(v, selectedAgent, origin);
                                    }}
                                />


                            </label>
                            {agentOptions.length > 0  ? (
                                <label className="module-label-input mt-3.75 text-left mx-5 w-[200px] ">
                                &nbsp;&nbsp; {t("scanLan.targetAgent")}
                                    <CustomSelect
                                        options={agentOptionsWithDefault}
                                        defaultValue={selectedAgent}
                                        value={selectedAgent ?? "select"}  
                                        Isdisabled={false}
                                        onChange={(e) => {
                                            setSelectedAgent(e)
                                        }}
                                    />

                                    
                                </label>
                                    ) : (
                                    <p className="text-sm text-orange-400 truncate m-2">
                                        {t("scanLan.noAgentsAvailable")}
                                    </p>
                                    )
                                }

                            

                        </div>
                    </div>
                    <div className={`  ${isMobile ? "w-[80%] h-0.5 mt-4 mx-auto" : "w-0.5 h-30"} bg-[#a4d6ff] dark:bg-[#444444]  mx-4 ml-7.5`}/>
                    <div className={` flex flex-col  ${isMobile ? "px-[2.5vw]": "ml-7.5 mr-15"}`}>
                        <div className="flex flex-row items-center ">
                            <label className=" text-[0.75rem] w-[200px] mt-2 font-thin text-[#162272] dark:text-[#D9D9D9] flex flex-col text-left">
                                &nbsp;&nbsp; {t("scanLan.format")}
                                <CustomSelect
                                    options={[
                                        {
                                        label: t("scanLan.formatOptions.onlyScreen"),
                                        value: "onlyscreen",
                                        },
                                        {
                                        label: t("scanLan.formatOptions.csv"),
                                        value: "csv",
                                        },
                                        {
                                        label: t("scanLan.formatOptions.pdf"),
                                        value: "pdf",
                                        },
                                        {
                                        label: t("scanLan.formatOptions.json"),
                                        value: "json",
                                        },
                                        {
                                        label: t("scanLan.formatOptions.markdown"),
                                        value: "markdown",
                                        },
                                    ]}
                                    defaultValue="onlyscreen"
                                    onChange={(v) => {setFormat(v)}}
                                    Isdisabled={false}
                                    />

                            </label>
                        </div>
                        {/* Mostra il menu personalizato solo se è selezionata l’opzione all’indice 3 */}
                        <label className="text-[0.75rem] font-thin text-[#162272] dark:text-[#D9D9D9] flex flex-col mt-4 text-left" data-type="ScanLanType">
                            &nbsp;&nbsp; {t("scanLan.scanType")}
                           <CustomSelect
                                options={[
                                    {
                                    label: t("scanLan.scanTypeOptions.quick"),
                                    value: "quick",
                                    },
                                    {
                                    label: t("scanLan.scanTypeOptions.complete"),
                                    value: "complete",
                                    },
                                    {
                                    label: t("scanLan.scanTypeOptions.deep"),
                                    value: "deep",
                                    },
                                ]}
                                defaultValue="complete"
                                onChange={(v) => {setScanTYpe(v)}}
                                Isdisabled={false}
                                isPreset={false}
                                />
                        </label>   
                    </div>
                </div>
                {/*Results Side*/}
                <div className={` ${isMobile ? "" : ""} border-b border-b-[#a4d6ff] dark:border-b-[#444444] my-5 w-[90%] mx-auto`} />
                <div className="flex flex-row items-center justify-start w-full">
                    <p className="ml-12 text-white mt-1.5 text-left">{t("scanLan.result")}</p>
                    <TooltipIcon  text={toolTipInfo.resultLAN}>
                        <FaQuestionCircle className="text-[#3355B4] w-5.75  cursor-pointer" />
                    </TooltipIcon>
                </div>
                <div className={`overflow-y-auto overflow-x-hidden w-[95%] mainApp-scroll mx-auto  bg-[#e0f0fd] dark:bg-[#3F3F3F] min-h-112.5 ${isMobile ? "h-[100vh]" : " h-[60vh]"} max-h-137.5 rounded-[5px] mb-15 mt-4`}>
                    {/* IF running but no results or no running at all */}
                    {(packetScanStream.length === 0) ? (
                        isRunning ? (
                            <div className="h-full flex flex-col items-center justify-center "> 
                            {/*Waiting for response */}
                                <LoadingSpinner />
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-[darkblue] dark:text-white"> 
                                {/* Before Scan */}
                                <p className="m-0 text-[1.5rem] text-center"> <b>{t("scanLan.noResult")}. </b> </p>
                                <p className="text-center px-4">{t("scanLan.noResultsSubtitle")}</p>               
                            </div>
                        )
                    ) : (
                        <div className="w-full overflow-x-auto mainApp-scroll-x"> 
                        {/* Results */}                       
                        {sortedScans.map((scan, scanIdx) => {
                            const localMeta = scanMeta[scan.meta.task_id];
                            const metaTarget =
                              scan.meta?.raw_target ??
                              scan.meta?.target ??
                              (scan.meta as any)?.ip_range ??
                              (scan.meta as any)?.targets?.[0];
                            const rawStarted =
                              scan.meta?.timestamp ??
                              scan.meta?.started_at ??
                              scan.meta?.startedAt ??
                              (scan.meta as any)?.started;
                            const startedAtMs =
                              typeof rawStarted === "number"
                                ? rawStarted
                                : typeof rawStarted === "string"
                                  ? Date.parse(rawStarted)
                                  : localMeta?.startedAt;
                            const startedAtLabel = Number.isFinite(startedAtMs)
                              ? new Date(startedAtMs as number).toLocaleTimeString()
                              : "N/A";
                            const targetLabel = metaTarget ?? localMeta?.target ?? "N/A";
                            const originAgentUuid = scan.origin?.agent_uuid ?? (scan.meta as any)?.agent_uuid;
                            const agentLabel = originAgentUuid
                              ? (agentNameById.get(originAgentUuid) ?? originAgentUuid)
                              : "N/A";

                            return (
                            <div key={scan.meta.task_id} className="scan-container flex flex-col ">
                                <div className={`scan-header flex flex-col bg-[#1f1f1f] text-gray-300 gap-1 py-1 ${isMobile ? "px-1.5" : "px-4"} align-center`}>
                                    <div className="flex flex-row items-center gap-2">
                                        <span className="bg-blue-600 px-2 rounded-sm h-6">{scanIdx+1}</span>
                                        <span className="text-sm mt-0.5">{startedAtLabel}</span>
                                        {!isMobile && (
                                            <span className="text-sm mt-0.5 text-gray-400">|</span>
                                        )}
                                        {!isMobile && (
                                            <span className="text-sm mt-0.5 max-w-[40vw] truncate">
                                                Agent: <span className="text-gray-100">{agentLabel}</span>
                                            </span>
                                        )}
                                        {scan.completata ? 
                                            <span className="ml-auto text-sm mt-0.5 text-green-600">
                                                {!isMobile &&  <span>Terminated in:</span>} <b>{scan.executionTime}s</b>
                                            </span>
                                            :
                                            <button 
                                                onClick={() => {
                                                    handleTerminationScan(scan.meta.task_id, origin, selectedAgent)
                                                }}
                                                className="ml-auto flex flex-row items-center gap-2 px-2 bg-gradient-to-r h-6 from-[#1D4ED8] to-[#1D4ED8] rounded-sm">
                                                <FaSquare/>
                                                {!isMobile && "Stop" }
                                            </button>
                                        }
                                    </div>
                                    {isMobile && (
                                        <div className="flex flex-row items-center gap-2 overflow-x-hidden">
                                            <span className="text-sm mt-0.5">Agent:</span>
                                            <span className="text-sm mt-0.5 max-w-[80vw] truncate">
                                                {agentLabel}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex flex-row items-center gap-2 overflow-x-hidden">
                                        <span className="text-sm mt-0.5">Target:</span>
                                        <span className={`text-sm mt-0.5 ${isMobile ? "max-w-[80vw] truncate" : ""}`}>
                                            {targetLabel}
                                        </span>
                                    </div>
                                </div>
                                {scan.hosts && scan.hosts.length > 0 && 
                                    (
                                    <table className="w-full text-white text-sm border-t-0 over mb-1">
                                        {!isMobile && (
                                        <thead className="dark:bg-[#1E1E1E] bg-[#1D4ED8] h-[35px] text-[0.9rem]  ">
                                            <tr>
                                                <th className="w-8"></th>
                                                <th>{t("scanLan.ip")}</th>
                                                <th>{t("scanLan.mac")}</th>
                                                <th>{t("scanLan.vendor")}</th>
                                                <th>{t("scanLan.hostname")}</th>
                                                <th>{t("scanLan.rtt")}</th>
                                                <th>{t("scanLan.openPorts")}</th>
                                                <th>{t("scanLan.system")}</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        )}
                                        <tbody>
                                             {[...scan.hosts].sort(compareByIpAsc).map((pkt, idx) => (
                                            <PacketScanRow
                                                key={`${scan.meta.task_id}-${idx}`}
                                                pkt={pkt}
                                                idx={idx}
                                                expanded={expandedRow === `${scanIdx}-${idx}`}
                                                onToggle={() => toggleRow(`${scanIdx}-${idx}`)}
                                                getPortRisk={getPortRisk}
                                            />
                                            ))}
                                        </tbody>
                                    </table>
                                    )
                                }                                                                     
                            </div>
                         );
                        })}
                      </div>                    
                    )}
                </div>
            </div>
                {isMobile && (
                  <button
                    type="button"
                    onClick={handleScrollDown}
                    className="fixed bottom-4 right-4 h-10 w-10 rounded-full bg-blue-600 text-white shadow-md flex items-center justify-center p-0"
                    aria-label="Scorri in basso"
                  >
                    <FaChevronDown size={16} />
                  </button>
                )}
        </div>
    )};
export default ScanLan;


