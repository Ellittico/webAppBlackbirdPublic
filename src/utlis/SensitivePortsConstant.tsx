// Porta : [lista di servizi considerati "ok" su quella porta]
// Porta/protocollo : [servizi ammessi]
export const SENSITIVE_PORTS: Record<string, string[]> = {
  // FTP
  "20/tcp": ["ftp-data"],
  "21/tcp": ["ftp", "ftps"],
  // SSH
  "22/tcp": ["ssh", "sftp"],
  // Telnet
  "23/tcp": ["telnet"],
  // Posta
  "25/tcp": ["smtp", "smtps"],
  "465/tcp": ["smtps"],
  "587/tcp": ["smtp", "submission"],
  // DNS
 "53/tcp": ["dns", "domain"],
 "53/udp": ["dns", "domain"],
  // TFTP
  "69/udp": ["tftp"],
  // POP3 / IMAP
  "110/tcp": ["pop3", "pop3s"],
  "143/tcp": ["imap", "imaps"],
  // RPC / Portmapper
  "111/tcp": ["rpcbind", "portmapper"],
  "111/udp": ["rpcbind", "portmapper"],
  "135/tcp": ["msrpc"],
  // NetBIOS
  "137/udp": ["netbios-ns"],
  "138/udp": ["netbios-dgm"],
  "139/tcp": ["netbios-ssn"],
  // NTP
  "123/udp": ["ntp"],
  // SNMP
  "161/udp": ["snmp"],
  "162/udp": ["snmptrap"],
  // LDAP
  "389/tcp": ["ldap"],
  "636/tcp": ["ldaps"],
  // SMB
  "445/tcp": ["microsoft-ds", "smb"],
  // Rexec / Rlogin / Rsh
  "512/tcp": ["exec"],
  "513/tcp": ["login"],
  "514/tcp": ["shell", "syslog"],
  // Rsync
  "873/tcp": ["rsync"],
  // Proxy
  "1080/tcp": ["socks", "socks5"],
  // Microsoft SQL Server
  "1433/tcp": ["ms-sql-s"],
  "1434/udp": ["ms-sql-m"],
  // Oracle
  "1521/tcp": ["oracle"],
  // NFS
  "2049/tcp": ["nfs"],
  "2049/udp": ["nfs"],
  // Zookeeper
  "2181/tcp": ["zookeeper"],
  // Docker API
  "2375/tcp": ["docker"],
  "2376/tcp": ["docker-ssl"],
  // MongoDB
  "27017/tcp": ["mongodb"],
  // MySQL
  "3306/tcp": ["mysql"],
  // RDP
  "3389/tcp": ["rdp", "ms-wbt-server"],
  // PostgreSQL
  "5432/tcp": ["postgresql"],
  // VNC
  "5800/tcp": ["vnc-http"],
  "5900/tcp": ["vnc"],
  "5901/tcp": ["vnc"],
  // Redis
  "6379/tcp": ["redis"],
  // HTTP(s) alternativi
  "8000/tcp": ["http", "https", "http-alt"],
  "8080/tcp": ["http", "https", "http-proxy"],
  "8443/tcp": ["https", "https-alt"],
  // Elasticsearch
  "9200/tcp": ["elasticsearch"],
  // Memcached
  "11211/tcp": ["memcached"],
};


export const GENERIC_OK_SERVICES: string[] = [
  "http", "https", 
  "dns",
  "ntp",
  "mdns",
  "upnp",
  "ssdp",
];
