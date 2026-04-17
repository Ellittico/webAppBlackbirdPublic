import { markScanStopped } from "../feature/scan/scanSlice";
import { store } from "../store";
import type {ScanConfig, ScanOutputFormat } from "../types/scan.type";
import type { WsOrigin } from "../types/ws.types";
import { uiGetLanAll } from "../ws/message/scan/getLanAll";
import { uiGetLanCurrent } from "../ws/message/scan/getLanCurrent";
import { startScan } from "../ws/message/scan/startScan";
import { stopScan } from "../ws/message/scan/stopScan";
import { sendMessage } from "../ws/tenantSocket";

//aggiorna target in base alla lan
export function handleTargetSubnet(v: "lan_all" | "lan_current", selectedAgent:string|null, origin:WsOrigin|null) {
  if (!selectedAgent || !origin) return
  //console.log(selectedAgent)
  if (v === "lan_all") {
    sendMessage(uiGetLanAll(selectedAgent,origin));
    return;
  }
  sendMessage(uiGetLanCurrent(selectedAgent,origin));
}

//send and adjust correction target
export function handleCorrect (inputValue:string) {
  if (!inputValue.trim()) return;
  //sendMessageWithResponse(
    //uiCorrectTargetIp(inputValue)
  //);
};

// Start Scan
export function startScanWithTarget(
  selectedAgent:string,
  origin:WsOrigin,
  correctedTarget:string,
  format:ScanOutputFormat,
  effectivePreset:ScanConfig
) {
  const scanId = crypto.randomUUID();
    const message = startScan(
      selectedAgent,
      origin,
      {
        scan_id: scanId,
        target_mode: "manual",
        ip_range: correctedTarget,
        exclude_ips: [],
        modules: (effectivePreset?.scan_modules.modules ?? []),

        dns_reverse: false, //levato dai preset
        allow_public_ips: effectivePreset ? effectivePreset?.scan_security.allow_public_ips : false,
        wave_max_targets: effectivePreset ? effectivePreset?.scan_timing.wave_max_targets : 1000,
        max_threads: effectivePreset ? effectivePreset?.scan_timing.max_threads : 500,

        discovery_mode: effectivePreset ? effectivePreset.scan_discovery.discovery_mode : "auto",
        always_ttl_enrich: effectivePreset ? effectivePreset.scan_discovery.always_ttl_enrich : false,

        icmp_timeout: effectivePreset ? effectivePreset.scan_icmp.icmp_timeout : "1s",
        icmp_retry: effectivePreset ? effectivePreset.scan_icmp.icmp_retry : 0,
        icmp_delay: effectivePreset ? effectivePreset.scan_icmp.icmp_delay : "0.1s",

        tcp_ports: [],
        udp_ports: [],

        tcp_mode:  effectivePreset ? effectivePreset.scan_ports.tcp_mode : "common",
        udp_mode:  effectivePreset ? effectivePreset.scan_ports.udp_mode : "common",

        tcp_timeout:  effectivePreset ? effectivePreset.scan_ports.tcp_timeout : "500ms",
        udp_timeout:  effectivePreset ? effectivePreset.scan_ports.udp_timeout :  "500ms",

        parallel_probes: effectivePreset ? effectivePreset.scan_ports.parallel_probes : 0,

        tcp_dial_timeout: effectivePreset ? effectivePreset.scan_ports.tcp_dial_timeout : "200ms",
        tcp_read_timeout: effectivePreset ? effectivePreset.scan_ports.tcp_read_timeout : "200ms",
        udp_dial_timeout: effectivePreset ? effectivePreset.scan_ports.udp_dial_timeout :"200ms",
        udp_read_timeout: effectivePreset ? effectivePreset.scan_ports.udp_read_timeout : "200ms",

        max_read_banner: effectivePreset ? effectivePreset.scan_ports.max_read_banner : 0, 

        os_timeout:effectivePreset ? effectivePreset.scan_os.os_timeout : "2s",
        os_use_known_ports: effectivePreset ? effectivePreset.scan_os.os_use_known_ports : false,

        enable_reverse_dns: effectivePreset ? effectivePreset.scan_dns.enable_reverse_dns : false,
        traceroute_max_hops:  effectivePreset ? effectivePreset.scan_traceroute.traceroute_max_hops: 0,

        adv_module_wait_timeout_ms: 5000, //tolta

        verbose: effectivePreset ? effectivePreset.scan_logging.verbose : false, 
        debug: effectivePreset ? effectivePreset.scan_logging.debug : false,
        safe_mode: effectivePreset ? effectivePreset.scan_logging.safe_mode : false,

        output_format: format,
        save_path: "",
      }
    );
  
  sendMessage(message);
}

// handle Termination SCAN
export function handleTerminationScan(
  task_id: string,
  origin: WsOrigin | null,
  selectedAgent: string | null
) {
  if (!origin || !selectedAgent) return
  store.dispatch(markScanStopped(task_id));
  const message = stopScan(selectedAgent, origin, task_id)
  sendMessage(message);
}


