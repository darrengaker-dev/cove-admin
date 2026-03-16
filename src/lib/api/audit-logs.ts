import { get } from "./client";
import type { PaginatedResponse } from "@/types/common";
import type { AuditLog, AuditLogFilter } from "@/types/audit-log";

export const getAuditLogs = (filter: AuditLogFilter) =>
  get<PaginatedResponse<AuditLog>>("/api/audit-logs", filter as unknown as Record<string, string | number | boolean | undefined>);
