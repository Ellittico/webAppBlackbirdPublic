export type ScanConfig = {
  scan_identity: ScanIdentity;
  scan_target:ScanTarget;
  scan_modules:ScanModules;
  scan_security:ScanSecurity;
  scan_timing:ScanTiming;
  scan_discovery:ScanDiscovery;
  scan_icmp:ScanICMP;
  scan_arp:ScanARP;
  scan_ports:ScanPorts;
  scan_os:ScanOS;
  scan_dns:ScanDNS;
  scan_traceroute:ScanTraceroute;
  scan_mac?:ScanMAC;
  scan_logging:ScanLogging;
  scan_output?:ScanOutput;
};
export type ScanIdentity = {
  scan_id:string
}

export type ScanTiming = {
  wave_max_targets: number;
  max_threads: number;
}

export type ScanTarget = {
  target_mode: TargetMode;
  ip_range: string;
  exclude_ips: string;
}

export type ScanSecurity ={
  allow_public_ips: boolean;
}

export type ScanModules={
  modules: ScanModule[];
}

export type ScanDiscovery = {
  discovery_mode: "fast" | "accurate" | "auto";
  always_ttl_enrich: boolean;
}

export type ScanICMP ={
  icmp_max_host_for_subware: number; //
  icmp_timeout: string;
  icmp_retry: number;
  icmp_delay: string; 
  icmp_payload: number; //
  icmp_ttl:string //
}

export type ScanARP = {
  arp_timeout:string; //
  arp_active_retries:number; //
  interface_name: string; //
  enable_self_tagging:boolean
  enable_gateway_tag:boolean //
}

export type ScanPorts = {
  tcp_ports: number[];
  udp_ports: number[];
  tcp_mode: "common" | "common" | "all";
  udp_mode: "common" | "common" | "all";
  tcp_timeout: string;
  udp_timeout: string;
  parallel_probes: number;
  tcp_dial_timeout: string;
  tcp_read_timeout: string;
  udp_dial_timeout: string;
  udp_read_timeout: string;
  max_read_banner: number;
}

export type ScanOS = {
  os_timeout: string;
  os_use_known_ports: boolean;
}

export type ScanDNS = {
  enable_reverse_dns: boolean;
  dns_timeout: string //aggiungere in time
}

export type ScanTraceroute = {
  traceroute_max_hops: number;
}

export type ScanMAC = {
  //
}

export type ScanLogging = {
  verbose: boolean;
  debug: boolean;
  safe_mode: boolean;
}

export type ScanOutput = {
  output_format: "json" | "csv" | "markdown" | "pdf" | "onlyscreen" | "";
  save_path: string;
}
export type ScanModule =
  | "icmp"
  | "arp"
  | "dns"
  | "mac_lookup"
  | "os_fingerprint"
  | "passive_fingerprint"
  | "tcp"
  | "udp"
  | "traceroute";

export type ScanOutputFormat =  | "onlyscreen"| "csv" | "pdf" | "json" | "markdown";

export type ScanTypes = "discovery" | "quick" | "complete" | "deep" | "custom"

export type TargetMode = "lan_current" | "lan_all" | "manual";

export type ScanLanTargetMode = "manual" | "lan_current" | "lan_all";

export type ScanLanDiscoveryMode = | "fast" | "accurate" | "auto";

export type ScanLanTcpUdpMode = "common" | "common-all";

export type ScanLanOutputFormat =  | "json"  | "csv"  | "markdown"  | "pdf" | "onlyscreen";

export interface TargetPreview {
  kind: string;
  label: string;
  start_ip?: string;
  end_ip?: string;
  hosts?: number;
}

export interface ResolvedTarget {
  previews: TargetPreview[];
  total_ips_estimated: number | null;
}

export interface ScanLanHost {
  RTT: any;
  IP: string;
  MAC: string;
  Hostname: string;
  Vendor: string;
  IsSelf: boolean;
  Reachable: boolean;
  TTL: number;
  rtt_ms: number;
  OpenTCP: number[] | null;
  OpenUDP: number[] | null;
  PassiveOS: string;
  OSGuess: string;
  Evidence: any | null;
  Hops: any[] | null; //traceroute
  ScanTime: string;
  Sources: string[];
  Notes: string[] | null;  //
}

export interface ScanLanStreamPayload {
  meta: {
    task_id: string;
    request_id: string;
    stopped: boolean;
    shared: boolean;
    raw_target?: string;
    timestamp?: string | number;
    target?: string;
    started_at?: string | number;
    startedAt?: string | number;
  };

  execution: {
    waves_total: number;
    wave_current: number;
    elapsed_ms: number;
  };

  progress: Record<string, any>;
  hosts: ScanLanHost[] | null;
  origin?: {
    agent_uuid: string;
    user_uuid: string;
    tenant_uuid: string;
    source: string;
  };
}

export interface ScanLanStreamState extends ScanLanStreamPayload {
  isRunning: boolean;
  completata: boolean;
  executionTime?:number
  lastUpdated?: number;
}

export interface ScanOutputIntent {
  task_id: string;
  output_format: ScanOutputFormat;
}

export type ScanLanStartPayload = {
  scan_id: string
  target_mode: "manual"
  ip_range: string
  exclude_ips: string[]
  modules: string[]
  dns_reverse: boolean
  allow_public_ips: boolean
  wave_max_targets: number
  max_threads: number
  discovery_mode: "fast" | "accurate" | "auto";
  always_ttl_enrich: boolean
  icmp_timeout: string
  icmp_retry: number
  icmp_delay: string
  tcp_ports: number[]
  udp_ports: number[]
  tcp_mode: "common" | "common" | "all";
  udp_mode: "common" | "common" | "all";
  tcp_timeout: string
  udp_timeout: string
  parallel_probes: number
  tcp_dial_timeout: string
  tcp_read_timeout: string
  udp_dial_timeout: string
  udp_read_timeout: string
  max_read_banner: number
  os_timeout: string
  os_use_known_ports: boolean
  enable_reverse_dns: boolean
  traceroute_max_hops: number
  adv_module_wait_timeout_ms: number
  verbose: boolean
  debug: boolean
  safe_mode: boolean
  output_format: "json" | "onlyscreen" | "csv" | "pdf" | "markdown"
  save_path: string
}

export type ScanLanStopPayload = {
  process_id: string
  agent_uuid:string
}

