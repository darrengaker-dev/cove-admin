import { http, HttpResponse } from "msw";
import type { PaginatedResponse } from "@/types/common";
import type { AuditLog } from "@/types/audit-log";
import { MOCK_LOGS } from "../data/audit-logs";

export const auditLogHandlers = [
  http.get("/api/audit-logs", ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") ?? "1");
    const limit = parseInt(url.searchParams.get("limit") ?? "20");
    const userId = url.searchParams.get("userId") ?? "";
    const action = url.searchParams.get("action") ?? "";
    const category = url.searchParams.get("category") ?? "";
    const result = url.searchParams.get("result") ?? "";
    const source = url.searchParams.get("source") ?? "";
    const startDate = url.searchParams.get("startDate") ?? "";
    const endDate = url.searchParams.get("endDate") ?? "";

    let filtered = MOCK_LOGS;
    if (userId)    filtered = filtered.filter((l) => l.userId === userId);
    if (action)    filtered = filtered.filter((l) => l.action === action);
    if (category)  filtered = filtered.filter((l) => l.category === category);
    if (result)    filtered = filtered.filter((l) => l.result === result);
    if (source)    filtered = filtered.filter((l) => l.source === source);
    if (startDate) filtered = filtered.filter((l) => l.createdAt >= startDate);
    if (endDate)   filtered = filtered.filter((l) => l.createdAt <= endDate + "T23:59:59Z");

    const start = (page - 1) * limit;
    return HttpResponse.json<PaginatedResponse<AuditLog>>({
      data: filtered.slice(start, start + limit),
      total: filtered.length,
      page,
      limit,
    });
  }),
];
