export type RemoteAgentNetworkInterface = {
  iface: string
  mac: string
  ip: string
  subnet: string
}

export type RemoteAgentPayload = {
  id: string
  owner_user_id: string
  display_name: string
  agent_id: string
  hostname: string
  os: string
  arch: string
  version: string
  commit: string
  build_date: string
  go_version: string
  network_interfaces: RemoteAgentNetworkInterface[]
  public_ip: string
  gateway_ip: string
  gateway_mac: string
  default_iface: string
  hops: unknown | null
  last_update: string
  continuous_ping: boolean
  monitoring: boolean
  base_logs: boolean
  perf_logs: boolean
  agent_rtt: number
  status: string
  last_internal_update: string
  first_seen: string
  last_seen: string
  created_at: string
  updated_at: string
}
