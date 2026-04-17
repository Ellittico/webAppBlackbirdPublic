import { SENSITIVE_PORTS } from './SensitivePortsConstant'

export type RiskLevel = 0 | 1 | 2;

export function usePortRisk() {

  function getPortRisk(port: number, protocol: "tcp" | "udp", service?: string): RiskLevel {

    //tipo procotollo con TCP/UDP
    const key = `${port}/${protocol.toLowerCase()}`;
    //formatting del service
    const svc = (service ?? '').toLowerCase();
    //controllo tipo porta
    const isSensitive = Boolean(SENSITIVE_PORTS[key]);
    const allowedServices = SENSITIVE_PORTS[key];

    if (svc === "unknown") { 
        return isSensitive ? 2 : 1;
     }

    if (isSensitive && Array.isArray(allowedServices) && !allowedServices.includes(svc)) {
        return 2;
     }

    return 0; 
  }
  return { getPortRisk };
}

/**
 * Livelli di rischio:
 * 0 = verde (ok)
 * 1 = giallo (attenzione) --> servizio "unknown" su porta non sensibile
 * 2 = rosso (rischio alto) --> servizio "unknown" su porta sensibile o non nell'elenco
 */