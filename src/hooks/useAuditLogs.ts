import { useQuery } from "@tanstack/react-query";
import { getAuditLogs } from "@/lib/api/audit-logs";
import type { AuditLogFilter } from "@/types/audit-log";

export function useAuditLogs(filter: AuditLogFilter) {
  return useQuery({
    queryKey: ["audit-logs", filter],
    queryFn: () => getAuditLogs(filter),
  });
}
