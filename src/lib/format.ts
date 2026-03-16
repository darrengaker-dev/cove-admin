import { format, formatDistanceToNow, parseISO } from "date-fns";
import { zhCN } from "date-fns/locale";

export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), "yyyy-MM-dd HH:mm");
}

export function formatDateShort(dateStr: string): string {
  return format(parseISO(dateStr), "yyyy-MM-dd");
}

export function formatRelativeTime(dateStr: string): string {
  return formatDistanceToNow(parseISO(dateStr), { addSuffix: true, locale: zhCN });
}

export function formatNumber(n: number): string {
  if (n >= 10000) return (n / 10000).toFixed(1) + "w";
  return n.toLocaleString();
}

export function maskApiKey(key: string): string {
  if (!key || key.includes("****")) return key;
  if (key.length <= 8) return "****";
  return key.slice(0, 4) + "****" + key.slice(-4);
}

export function formatChangePercent(change: number): string {
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(1)}%`;
}
