import React from "react";
import { FaAngleDoubleDown, FaAngleDoubleUp } from "react-icons/fa";
import { motion } from "framer-motion";
import {normalizePorts, normalizeTcpPorts, normalizeUdpPorts} from "../utlis/normalizePorts";

//TRADUZIONI
import { useTranslation } from "react-i18next";
import type { ScanLanHost } from "../types/scan.type";

type Protocol = "tcp" | "udp";


interface PacketRowProps {
  pkt: ScanLanHost;
  idx: number;
  expanded: boolean;
  onToggle: () => void;
  getPortRisk: (port: number, proto: Protocol, service: string) => 0 | 1 | 2;
}
const PacketScanRow: React.FC<PacketRowProps> = ({ pkt, idx, expanded, onToggle, getPortRisk }) =>{
     const { t } = useTranslation();
    return(
        <React.Fragment key={idx}>
            <motion.tr
                key={idx}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.05 }} // effetto a cascata
                className={`border-b border-[white] dark:border-[#4d4c4c] h-[35px] w-full max-w-full w-min-[1000px] text-[0.75rem] md:text-[0.9rem] ${
                idx % 2 === 0 ? "bg-[#d0e3ff] dark:bg-[#3b3b3b]" : "bg-[#edf4ff] dark:bg-[#4d4c4c]"
                }`}
                onClick={onToggle}
            >
                <td className="h-8 w-8 flex items-center justify-center text-center"
                > 
                    <div
                    className="rounded-full h-[15px] w-[15px]"
                    style={{
                        backgroundColor: (() => {
                        if (pkt.IsSelf) return "#1D4ED8"; // blu se host origine

                        const rtt = pkt.RTT
                            ? Number(pkt.RTT) / 1_000_000 // ns → ms
                            : pkt.rtt_ms ?? null;         // già in ms

                        if (rtt == null) return "#666666"; // default grigio se mancante
                        if (rtt <= 50) return "#32E24C";   // verde
                        if (rtt > 150) return "#FE2929";   // rosso
                        return "#FFD900";                  // giallo (51–150)
                        })(),
                    }}
                    ></div>


                </td>
                <td className="td-fixed-125 dark:border-l-[#2C2C2C] border-l border-l-white"> 
                    <p className="module-text-noResult h-full my-1.75 dark:text-white text-[#0b0b38]">{pkt.IP}</p>
                </td>
                <td className="td-fixed-125 dark:border-l-[#2C2C2C] border-l border-l-white hidden md:table-cell">
                    <p className="module-text-noResult my-1.75 dark:text-white text-[#0b0b38] ">{pkt.MAC || "—"}</p>
                </td>
                <td className="td-fixed-125 dark:text-white text-[#0b0b38] dark:border-l-[#2C2C2C] border-l border-l-white hidden md:table-cell">
                   {(pkt.Vendor||pkt.Vendor) ? (
                    <span className="pl-2">{pkt.Vendor|| pkt.Vendor}</span>
                    ) : (
                    <p className="module-text-noResult dark:text-white text-[#0b0b38]">—</p>
                    )}

                </td>
                <td className="pl-[8px] md:pl-[15px] border-l text-center dark:border-l-[#2C2C2C] w-[150px] max-w-[130px] pr-[8px] md:pr-[15px] dark:text-white text-[#0b0b38] border-l-white">
                    {pkt.Hostname ? (
                        <span className="block mx-auto max-w-[110px] truncate">{pkt.Hostname}</span>
                    ) : (
                        <p className="module-text-noResult dark:text-white text-[#0b0b38]">—</p>
                    )}
                </td>
                <td className="w-[60px] border-l dark:border-l-[#2C2C2C] px-[5px] dark:text-white text-[#0b0b38] border-l-white hidden md:table-cell">
                   <p className="w-full text-center m-0">
                    {pkt.RTT
                        ? (pkt.RTT / 1_000_000).toFixed(2)
                        : pkt.rtt_ms
                        ? (pkt.rtt_ms).toFixed(2)
                        : "—"}
                    </p>
                </td>
                <td className="px-[6px] md:px-[10px] max-w-[25vh] flex-1 min-w-[15vh] overflow-hidden border-l-white dark:border-l-[#2C2C2C] border-l hidden md:table-cell">
                   <div className="flex  gap-1.5 overflow-hidden">
                        {normalizePorts(pkt).map(({ port, service, protocol }) => {
                            const riskLevel = getPortRisk(port, protocol, service);

                            return (
                            <span
                                key={`${protocol}-${port}`}
                                className={`px-2 py-[2px] text-xs rounded-sm border dark:bg-[#1e1e1e] bg-[#1D4ED8] ${
                                riskLevel === 0
                                    ? "dark:border-[#242424] border-[#1D4ED8]"
                                    : riskLevel === 1
                                    ? "border-[#FFD900]"
                                    : "border-[#FE2929]"
                                }`}
                                title={`${protocol.toUpperCase()} ${service} (${port})`}
                            >
                                {port}
                            </span>
                            );
                        })}
                    </div>
                </td>
                <td className="td-fixed-225 dark:text-white text-[#0b0b38] border-l-white dark:border-l-[#2C2C2C] border-l hidden md:table-cell">
                    {pkt.OSGuess ?
                     pkt.OSGuess 
                    : pkt.PassiveOS ?
                      pkt.PassiveOS 
                    : <p className="module-text-noResult">—</p>}

                </td>
                <td className="w-[30px]" >
                    {expanded ? (
                        <FaAngleDoubleUp className="ml-1 mt-1 bg-[#1D4ED8] p-[2px] text-[18px] rounded-xs" />
                    ) : (
                        <FaAngleDoubleDown className="ml-1 mt-1 bg-[#1D4ED8] p-[2px] text-[18px] rounded-xs" />
                    )}
                    </td>
                </motion.tr>
                {expanded && (
                    <tr className="bg-white dark:bg-[#2A2A2A] border-b dark:border-[#444] ">
                        <td colSpan={10} className="p-[15px] text-sm text-[#0e0e46] dark:text-white">
                            <div className="md:hidden grid grid-cols-1 gap-2 mb-3">
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-gray-100">MAC</span>
                                    <span className="text-gray-200">{pkt.MAC || "--"}</span>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-gray-100">Vendor</span>
                                    <span className="text-gray-200">{pkt.Vendor || "--"}</span>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-gray-100">RTT</span>
                                    <span className="text-green-200">
                                        {pkt.RTT
                                            ? (pkt.RTT / 1_000_000).toFixed(2)
                                            : pkt.rtt_ms
                                            ? (pkt.rtt_ms).toFixed(2)
                                            : "--"}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-gray-100">OS</span>
                                    <span className="text-gray-200">
                                        {pkt.PassiveOS
                                            ? pkt.PassiveOS 
                                            : pkt.OSGuess 
                                            ? pkt.OSGuess 
                                            : "--"}
                                    </span>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-[10px] md:gap-[15px]">
                                <div><b>{t("hostDetails.ttl")}:</b>{pkt.TTL|| "64"} ms</div>
                                <div className="hidden md:block"><b>{t("hostDetails.vendor")}:</b> {pkt.Vendor  || "n/a"}</div>
                                <div></div>
                                
                            </div>
                            <div className="my-[10px] md:my-[15px] overflow-hidden text-ellipsis whitespace-nowrap max-w-[calc(100%-100px)] hidden md:block">
                                <b>{t("hostDetails.system")}:</b>{" "}
                                {pkt.PassiveOS
                                    ? pkt.PassiveOS 
                                    : pkt.OSGuess 
                                    ? pkt.OSGuess 
                                    : <p className="module-text-noResult">—</p>}
                            </div>
                                <div className="my-[10px] md:my-[15px]">
                                <b>{t("hostDetails.traceroute")}:</b>{" "}
                                {pkt.Sources?.length
                                    ? (() => {
                                        const hop = pkt.Sources[0] as string | { value: string };
                                        return typeof hop === "string" ? hop : hop.value;
                                    })()
                                    : pkt.Sources?.length
                                    ? (() => {
                                        const hop = pkt.Sources[0] as string | { value: string };
                                        return typeof hop === "string" ? hop : hop.value;
                                    })()
                                    : "n/a"}
                            </div>


                            <div className="my-[10px] md:my-[15px]">
                                <b>{t("hostDetails.origins")}:</b>
                                {(() => {
                                    const origins = (pkt.Sources ?? pkt.Sources) as Array<string | { position?: string; module_name?: string }> | undefined;

                                    if (!origins || origins.length === 0) {
                                    return <span className="module-text-noResult">—</span>;
                                    }

                                    return origins.map((origin, index) => {
                                    let display: string;

                                    if (typeof origin === "string") {
                                        display = origin;
                                    } else if (typeof origin === "object" && origin !== null) {
                                        display = origin.module_name ?? origin.position ?? JSON.stringify(origin);
                                    } else {
                                        display = String(origin);
                                    }

                                    return (
                                        <span className="pl-1" key={index}>
                                        {display}
                                        {index < origins.length - 1 ? "," : ""}
                                        </span>
                                    );
                                    });
                                })()}
                            </div>
                            <div className="border-b border-b-[#dde5fd] dark:border-b-[#444444] mt-[20px] md:mt-[30px] w-[90%] mx-auto"></div>
                            <div className="my-[10px] grid grid-cols-1 md:grid-cols-2 gap-4" >
                                <div className="my-[10px] grid grid-cols-2 content-start md:border-r border-r-[#dde5fd] dark:border-r-[#444444]">
                                {normalizeTcpPorts(pkt).length > 0 ? (
                                    <>
                                    <b className="module-text-noResult text-center mb-2">{t("hostDetails.tcpPorts")}:</b>
                                    <b className="module-text-noResult text-center mb-2">{t("hostDetails.tcpServices")}:</b>

                                    {normalizeTcpPorts(pkt).map(({ port, service }) => (
                                        <React.Fragment key={`tcp-${port}`}>
                                        <p className="w-full text-center my-1">{port}</p>
                                        <p className="w-full text-center">{service}</p>
                                        </React.Fragment>
                                    ))}
                                    </>
                                ) : (
                                    <p className="col-span-2 text-center text-gray-400">{t("hostDetails.noTcpPorts")}</p>
                                )}
                            </div>
                            <div className="my-[10px] grid grid-cols-2 md:pl-[10px] content-start">
                                {normalizeUdpPorts(pkt).length > 0 ? (
                                    <>
                                    <b className="module-text-noResult text-center mb-2">{t("hostDetails.udpPorts")}:</b>
                                    <b className="module-text-noResult text-center mb-2">{t("hostDetails.udpServices")}:</b>

                                    {normalizeUdpPorts(pkt).map(({ port, service }) => (
                                        <React.Fragment key={`udp-${port}`}>
                                        <p className="w-full text-center my-1">{port}</p>
                                        <p className="w-full text-center">{service}</p>
                                        </React.Fragment>
                                    ))}
                                    </>
                                ) : (
                                    <p className="col-span-2 text-center text-gray-400">{t("hostDetails.noUdpPorts")}</p>
                                )}
                            </div>
                            </div>
                        </td>
                    </tr>
        )}
        </React.Fragment>
    )
}  

export default PacketScanRow;








