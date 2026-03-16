import { http, HttpResponse } from "msw";
import type { PaginatedResponse } from "@/types/common";
import type { Member, BanUserRequest, ResetPasswordResponse } from "@/types/user";
import { MOCK_MEMBERS } from "../data/users";

const members = [...MOCK_MEMBERS];

export const userHandlers = [
  http.get("/api/users", ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") ?? "1");
    const limit = parseInt(url.searchParams.get("limit") ?? "20");
    const search = url.searchParams.get("search") ?? "";
    const status = url.searchParams.get("status") ?? "";
    const deptId = url.searchParams.get("deptId") ?? "";

    let filtered = members;
    if (search) {
      filtered = filtered.filter(
        (u) => u.name.includes(search) || u.loginName.includes(search)
      );
    }
    if (status) filtered = filtered.filter((u) => u.status === status);
    if (deptId) filtered = filtered.filter((u) => u.primaryDeptId === deptId);

    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);

    return HttpResponse.json<PaginatedResponse<Member>>({ data, total: filtered.length, page, limit });
  }),

  http.patch("/api/users/:id/ban", async ({ params, request }) => {
    const id = params["id"] as string;
    const body = await request.json() as BanUserRequest;
    const idx = members.findIndex((u) => u.id === id);
    if (idx === -1) return HttpResponse.json({ message: "成员不存在" }, { status: 404 });
    void body;
    members[idx] = { ...members[idx]!, status: "disabled" };
    return HttpResponse.json<Member>(members[idx]!);
  }),

  http.patch("/api/users/:id/unban", ({ params }) => {
    const id = params["id"] as string;
    const idx = members.findIndex((u) => u.id === id);
    if (idx === -1) return HttpResponse.json({ message: "成员不存在" }, { status: 404 });
    members[idx] = { ...members[idx]!, status: "active" };
    return HttpResponse.json<Member>(members[idx]!);
  }),

  http.post("/api/users/:id/reset-password", () => {
    const chars = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678";
    const pw = Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    return HttpResponse.json<ResetPasswordResponse>({ temporaryPassword: pw });
  }),
];
