export type NormalizedPort = {
  port: number;
  service: string;
  protocol: "tcp" | "udp";
};

const normalizeService = (service: any) => {
  if (service && typeof service === "object") {
    return String(service.Name ?? service.name ?? "unknown");
  }
  return String(service ?? "unknown");
};

export function normalizePorts(pkt: any): NormalizedPort[] {
  let tcpPorts: NormalizedPort[] = [];
  let udpPorts: NormalizedPort[] = [];

  // --- TCP ---
  if (pkt.OpenPortsTCP ?? pkt.OpenTCP) {
    const source = pkt.OpenPortsTCP ?? pkt.OpenTCP;
    tcpPorts = Object.entries(source).map(([port, service]) => ({
      port: parseInt(port, 10),
      service: normalizeService(service),
      protocol: "tcp",
    }));
  } else if (pkt.ports_tcp) {
    tcpPorts = pkt.ports_tcp.map((p: any) => ({
      port: p.port,
      service: normalizeService(p.service),
      protocol: "tcp",
    }));
  }

  // --- UDP ---
  if (pkt.OpenPortsUDP ?? pkt.OpenUDP) {
    const source = pkt.OpenPortsUDP ?? pkt.OpenUDP;
    udpPorts = Object.entries(source).map(([port, service]) => ({
      port: parseInt(port, 10),
      service: normalizeService(service),
      protocol: "udp",
    }));
  } else if (pkt.ports_udp) {
    udpPorts = pkt.ports_udp.map((p: any) => ({
      port: p.port,
      service: normalizeService(p.service),
      protocol: "udp",
    }));
  }

  // --- Merge: se la porta esiste già in TCP, ignoro la UDP ---
  const tcpSet = new Set(tcpPorts.map((p) => p.port));
  udpPorts = udpPorts.filter((p) => !tcpSet.has(p.port));

  return [...tcpPorts, ...udpPorts];
}
export function normalizeTcpPorts(pkt: any): NormalizedPort[] {
  let tcpPorts: NormalizedPort[] = [];

  if (pkt.OpenPortsTCP ?? pkt.OpenTCP) {
    const source = pkt.OpenPortsTCP ?? pkt.OpenTCP;
    tcpPorts = Object.entries(source).map(([port, service]) => ({
      port: parseInt(port, 10),
      service: normalizeService(service),
      protocol: "tcp" as const,
    }));
  } else if (pkt.ports_tcp) {
    tcpPorts = pkt.ports_tcp.map((p: any) => ({
      port: p.port,
      service: normalizeService(p.service),
      protocol: "tcp" as const,
    }));
  }

  return tcpPorts;
}

export function normalizeUdpPorts(pkt: any): NormalizedPort[] {
  let udpPorts: NormalizedPort[] = [];

  if (pkt.OpenPortsUDP ?? pkt.OpenUDP) {
    const source = pkt.OpenPortsUDP ?? pkt.OpenUDP;
    udpPorts = Object.entries(source).map(([port, service]) => ({
      port: parseInt(port, 10),
      service: normalizeService(service),
      protocol: "udp" as const,
    }));
  } else if (pkt.ports_udp) {
    udpPorts = pkt.ports_udp.map((p: any) => ({
      port: p.port,
      service: normalizeService(p.service),
      protocol: "udp" as const,
    }));
  }

  return udpPorts;
}
