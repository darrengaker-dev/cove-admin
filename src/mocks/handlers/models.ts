import { http, HttpResponse } from "msw";
import type { ModelConfig, UsageStat, Platform, PlatformAccount, PlatformModel } from "@/types/model";
import {
  MOCK_MODEL_CONFIGS, generateUsageStats,
  MOCK_PLATFORMS, MOCK_PLATFORM_ACCOUNTS, MOCK_PLATFORM_MODELS,
} from "../data/models";

let configs = [...MOCK_MODEL_CONFIGS];
let platforms = [...MOCK_PLATFORMS];
let accounts = [...MOCK_PLATFORM_ACCOUNTS];
let models = [...MOCK_PLATFORM_MODELS];

export const modelHandlers = [
  // ── 旧接口（保留）──────────────────────────────────
  http.get("/api/models/config", () => HttpResponse.json<ModelConfig[]>(configs)),
  http.put("/api/models/config", async ({ request }) => {
    configs = await request.json() as ModelConfig[];
    return HttpResponse.json<ModelConfig[]>(configs);
  }),
  http.get("/api/models/usage", ({ request }) => {
    const url = new URL(request.url);
    const days = parseInt(url.searchParams.get("days") ?? "30");
    return HttpResponse.json<UsageStat[]>(generateUsageStats(days));
  }),

  // ── 平台 CRUD ─────────────────────────────────────
  http.get("/api/platforms", () => {
    const enriched = platforms.map((p) => ({
      ...p,
      modelCount: models.filter((m) => m.platformId === p.id).length,
      clientModelCount: models.filter((m) => m.platformId === p.id && m.isClientVisible).length,
    }));
    return HttpResponse.json<Platform[]>(enriched);
  }),

  http.post("/api/platforms", async ({ request }) => {
    const body = await request.json() as Omit<Platform, "id" | "modelCount" | "clientModelCount">;
    const next: Platform = {
      ...body,
      id: `platform-${Date.now()}`,
      modelCount: 0,
      clientModelCount: 0,
    };
    platforms.push(next);
    return HttpResponse.json<Platform>(next, { status: 201 });
  }),

  http.put("/api/platforms/:id", async ({ params, request }) => {
    const body = await request.json() as Partial<Platform>;
    platforms = platforms.map((p) => p.id === params["id"] ? { ...p, ...body } : p);
    return HttpResponse.json<Platform>(platforms.find((p) => p.id === params["id"])!);
  }),

  http.delete("/api/platforms/:id", ({ params }) => {
    platforms = platforms.filter((p) => p.id !== params["id"]);
    accounts = accounts.filter((a) => a.platformId !== params["id"]);
    models = models.filter((m) => m.platformId !== params["id"]);
    return new HttpResponse(null, { status: 204 });
  }),

  // ── 账号 CRUD ─────────────────────────────────────
  http.get("/api/platforms/:platformId/accounts", ({ params }) => {
    return HttpResponse.json<PlatformAccount[]>(
      accounts.filter((a) => a.platformId === params["platformId"])
    );
  }),

  http.post("/api/platforms/:platformId/accounts", async ({ params, request }) => {
    const body = await request.json() as Omit<PlatformAccount, "id" | "platformId">;
    const next: PlatformAccount = { ...body, id: `acct-${Date.now()}`, platformId: params["platformId"] as string };
    accounts.push(next);
    return HttpResponse.json<PlatformAccount>(next, { status: 201 });
  }),

  http.put("/api/platforms/:platformId/accounts/:id", async ({ params, request }) => {
    const body = await request.json() as Partial<PlatformAccount>;
    accounts = accounts.map((a) => a.id === params["id"] ? { ...a, ...body } : a);
    return HttpResponse.json<PlatformAccount>(accounts.find((a) => a.id === params["id"])!);
  }),

  http.delete("/api/platforms/:platformId/accounts/:id", ({ params }) => {
    accounts = accounts.filter((a) => a.id !== params["id"]);
    return new HttpResponse(null, { status: 204 });
  }),

  // ── 模型 CRUD ─────────────────────────────────────
  http.get("/api/platforms/:platformId/models", ({ params }) => {
    return HttpResponse.json<PlatformModel[]>(
      models.filter((m) => m.platformId === params["platformId"])
    );
  }),

  http.post("/api/platforms/:platformId/models", async ({ params, request }) => {
    const body = await request.json() as Omit<PlatformModel, "id" | "platformId">;
    const next: PlatformModel = { ...body, id: `model-${Date.now()}`, platformId: params["platformId"] as string };
    models.push(next);
    return HttpResponse.json<PlatformModel>(next, { status: 201 });
  }),

  http.put("/api/platforms/:platformId/models/:id", async ({ params, request }) => {
    const body = await request.json() as Partial<PlatformModel>;
    models = models.map((m) => m.id === params["id"] ? { ...m, ...body } : m);
    return HttpResponse.json<PlatformModel>(models.find((m) => m.id === params["id"])!);
  }),

  http.delete("/api/platforms/:platformId/models/:id", ({ params }) => {
    models = models.filter((m) => m.id !== params["id"]);
    return new HttpResponse(null, { status: 204 });
  }),
];
