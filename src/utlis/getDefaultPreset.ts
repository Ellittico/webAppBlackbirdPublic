import type { ScanConfig } from "../types/scan.type";

export const defaultPreset: Record<
  "complete" | "quick" | "deep",
  ScanConfig
> = {
    complete:{
        scan_identity: {
            scan_id: "",
        },
        scan_target:{
            target_mode: "manual",
            ip_range: "",
            exclude_ips: "",
        },
        scan_modules:{
            modules: ["icmp","arp","dns","mac_lookup","passive_fingerprint","tcp", "udp"],
        },
        scan_security:{
            allow_public_ips: false,
        },
        scan_timing:{
            wave_max_targets: 1000,
            max_threads: 500,
        },
        scan_discovery:{
            discovery_mode: "fast",
            always_ttl_enrich: false,
        },
        scan_icmp:{
            icmp_max_host_for_subware: 20, 
            icmp_timeout: "1s",
            icmp_retry: 0,
            icmp_delay: "100ms",
            icmp_payload:200, 
            icmp_ttl: "128ms" 
        },
        scan_arp:{
            arp_timeout: "300ms", //non inserito
            arp_active_retries: 1, //non inserito
            interface_name: "" , //non inserito
            enable_self_tagging:true, 
            enable_gateway_tag: true
        },
        scan_ports:{
            tcp_ports: [],
            udp_ports: [],
            tcp_mode: "common" ,
            udp_mode: "common",
            tcp_timeout: "500ms",
            udp_timeout: "500ms",
            parallel_probes: 300,
            tcp_dial_timeout: "400ms",
            tcp_read_timeout: "400ms",
            udp_dial_timeout: "400ms",
            udp_read_timeout: "400ms",
            max_read_banner: 0,
        },
        scan_os:{
            os_timeout: "2s",
            os_use_known_ports: false,
        },
        scan_dns:{
            enable_reverse_dns: false,
            dns_timeout: "300ms" 
        },
        scan_traceroute:{
            traceroute_max_hops: 0,
        },
        //scan_mac:ScanMAC;
        scan_logging:{
            verbose: false,
            debug: false,
            safe_mode: false,
        },
        scan_output:{
            output_format: "json",
            save_path: "",
        }
    },
    quick:{        
        scan_identity: {
            scan_id: "",
        },
        scan_target:{
            target_mode: "manual",
            ip_range: "",
            exclude_ips: "",
        },
        scan_modules:{
            modules: [],
        },
        scan_security:{
            allow_public_ips: false,
        },
        scan_timing:{
            wave_max_targets: 1000,
            max_threads: 500,
        },
        scan_discovery:{
            discovery_mode: "fast",
            always_ttl_enrich: false,
        },
        scan_icmp:{
            icmp_max_host_for_subware: 20, //boh
            icmp_timeout: "1s",
            icmp_retry: 0,
            icmp_delay: "100ms",
            icmp_payload:200, //boh
            icmp_ttl: "128ms" //boh
        },
        scan_arp:{
            arp_timeout: "300ms", //boh
            arp_active_retries: 1, //boh
            interface_name: "" ,// boh
            enable_self_tagging:true, 
            enable_gateway_tag: false // boh
        },
        scan_ports:{
            tcp_ports: [],
            udp_ports: [],
            tcp_mode: "common" ,
            udp_mode: "common",
            tcp_timeout: "500ms",
            udp_timeout: "500ms",
            parallel_probes: 0,
            tcp_dial_timeout: "200ms",
            tcp_read_timeout: "200ms",
            udp_dial_timeout: "200ms",
            udp_read_timeout: "200ms",
            max_read_banner: 0,
        },
        scan_os:{
            os_timeout: "2s",
            os_use_known_ports: false,
        },
        scan_dns:{
            enable_reverse_dns: false,
            dns_timeout: "300ms" //boh
        },
        scan_traceroute:{
            traceroute_max_hops: 0,
        },
        //scan_mac:ScanMAC;
        scan_logging:{
            verbose: false,
            debug: false,
            safe_mode: false,
        },
        scan_output:{
            output_format: "json",
            save_path: "",
        }
    },
    deep:{        
        scan_identity: {
            scan_id: "",
        },
        scan_target:{
            target_mode: "manual",
            ip_range: "",
            exclude_ips: "",
        },
        scan_modules:{
            modules: ["icmp","arp","dns","mac_lookup","os_fingerprint","passive_fingerprint","tcp", "udp", "traceroute"],
        },
        scan_security:{
            allow_public_ips: false,
        },
        scan_timing:{
            wave_max_targets: 1000,
            max_threads: 500,
        },
        scan_discovery:{
            discovery_mode: "fast",
            always_ttl_enrich: false,
        },
        scan_icmp:{
            icmp_max_host_for_subware: 20,
            icmp_timeout: "1s",
            icmp_retry: 0,
            icmp_delay: "100ms",
            icmp_payload:200, 
            icmp_ttl: "128ms" 
        },
        scan_arp:{
            arp_timeout: "300ms", 
            arp_active_retries: 1, 
            interface_name: "" ,
            enable_self_tagging:true, 
            enable_gateway_tag: false 
        },
        scan_ports:{
            tcp_ports: [],
            udp_ports: [],
            tcp_mode: "common" ,
            udp_mode: "common",
            tcp_timeout: "500ms",
            udp_timeout: "500ms",
            parallel_probes: 0,
            tcp_dial_timeout: "200ms",
            tcp_read_timeout: "200ms",
            udp_dial_timeout: "200ms",
            udp_read_timeout: "200ms",
            max_read_banner: 0,
        },
        scan_os:{
            os_timeout: "2s",
            os_use_known_ports: false,
        },
        scan_dns:{
            enable_reverse_dns: false,
            dns_timeout: "300ms" //boh
        },
        scan_traceroute:{
            traceroute_max_hops: 0,
        },
        //scan_mac:ScanMAC;
        scan_logging:{
            verbose: false,
            debug: false,
            safe_mode: false,
        },
        scan_output:{
            output_format: "",
            save_path: "",
        }
    },
}
