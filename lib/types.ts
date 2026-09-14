export type DiagramKey =
  | "client-server"
  | "ip-port"
  | "ip-privat-publik"
  | "protokol"
  | "dns"
  | "terminal"
  | "permission"
  | "linux-folder"
  | "vm-dalam-host"
  | "nat"
  | "bridged"
  | "host-only-nat"
  | "ssh-flow"
  | "firewall"
  | "ssh-key"
  | "proses-mati"
  | "process-manager"
  | "systemd-analogi"
  | "reverse-proxy"
  | "php-fpm"
  | "tunnel"
  | "tunnel-vs-port-forward"
  | "arsitektur-lengkap"
  | "docker";

export type Block =
  | { t: "h"; text: string }
  | { t: "p"; text: string }
  | { t: "ul"; items: string[] }
  | { t: "ol"; items: string[] }
  | { t: "cmd"; text: string; note?: string }
  | { t: "file"; name: string; text: string; note?: string }
  | { t: "callout"; kind?: "info" | "warn" | "tip"; text: string }
  | { t: "table"; headers: string[]; rows: string[][] }
  | { t: "diagram"; key: DiagramKey; caption?: string };

export interface StackVariant {
  id: string;
  label: string;
  desc: string;
  content: Block[];
}

export interface TroubleshootingItem {
  q: string;
  a: Block[];
}

export interface Step {
  slug: string;
  title: string;
  summary: string;
  content: Block[];
  checklist: string[];
  requireChecklist?: boolean;
  troubleshooting?: TroubleshootingItem[];
  variants?: StackVariant[];
  references?: { label: string; url: string }[];
}

export interface Part {
  id: number;
  title: string;
  desc: string;
  steps: Step[];
}

export interface FlatStep extends Step {
  number: number; // 1-based global
  partId: number;
  partTitle: string;
  total: number;
}
