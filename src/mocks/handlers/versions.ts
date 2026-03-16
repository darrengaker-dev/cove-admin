import { http, HttpResponse } from "msw"
import type { AppVersion, UpdateRecord, UpdatePolicy, ClientStats } from "@/types/version"

const current: AppVersion = {
  version: "1.2.3",
  releaseDate: "2026-02-15",
  releaseNotes: "修复了若干已知问题，提升了稳定性。",
  channel: "stable",
}

const latest: AppVersion = {
  version: "1.3.0",
  releaseDate: "2026-03-10",
  releaseNotes: "新增企业版多租户支持；优化对话响应速度，平均降低 30%；修复文档插件在 WPS 2019 下的兼容性问题；新增 DLP 敏感信息检测引擎。",
  channel: "stable",
}

let policy: UpdatePolicy = {
  autoUpdate: true,
  channel: "stable",
  forceMinVersion: "1.0.0",
  installMode: "silent_restart",
  scheduledEnabled: true,
  scheduledStart: "22:00",
  scheduledEnd: "06:00",
}

const clientStats: ClientStats = {
  totalClients: 152,
  updatedClients: 128,
  pendingClients: 24,
  distribution: [
    { version: "1.2.3", count: 128, isLatest: false },
    { version: "1.2.0", count: 18,  isLatest: false },
    { version: "1.1.0", count: 6,   isLatest: false },
  ],
  osDistribution: [
    { os: "Windows 11",  count: 68 },
    { os: "Windows 10",  count: 41 },
    { os: "macOS",       count: 24 },
    { os: "UOS / 统信",  count: 12 },
    { os: "麒麟 Kylin",  count: 7  },
  ],
}

const history: UpdateRecord[] = [
  {
    id: "upd-1",
    fromVersion: "1.1.0",
    toVersion: "1.2.3",
    updatedAt: "2026-02-15T10:30:00Z",
    clientCount: 128,
    status: "success",
    errorMessage: null,
    releaseNotes: "优化对话流式响应，减少首字节延迟；修复 macOS 13 系统下窗口偶发闪烁问题；DLP 规则引擎升级，身份证号识别精度提升至 99.2%；解决 Cove in Word 插件与 WPS Office 2021 的加载兼容性问题；新增模型响应超时自动重试机制。",
  },
  {
    id: "upd-2",
    fromVersion: "1.0.5",
    toVersion: "1.1.0",
    updatedAt: "2026-01-20T09:00:00Z",
    clientCount: 145,
    status: "success",
    errorMessage: null,
    releaseNotes: "新增 @mention 功能，支持在对话中快速引用工具和技能；重构侧边栏布局，提升信息密度；新增快捷键自定义配置页面；修复多租户环境下用户权限缓存不一致的问题；改善深色模式下输入框对比度。",
  },
  {
    id: "upd-3",
    fromVersion: "1.0.4",
    toVersion: "1.0.5",
    updatedAt: "2025-12-28T14:20:00Z",
    clientCount: 98,
    status: "partial",
    errorMessage: "47 台终端网络超时，已自动重试",
    releaseNotes: "修复消息列表在特定网络环境下无限加载的问题；优化图片上传压缩逻辑，降低带宽占用约 40%；新增对话导出为 PDF 功能（Beta）；修复信创环境下字体渲染异常；提升启动速度约 15%。",
  },
]

export const versionHandlers = [
  http.get("/api/versions/current",  () => HttpResponse.json<AppVersion>(current)),
  http.get("/api/versions/latest",   () => HttpResponse.json<AppVersion>(latest)),
  http.get("/api/versions/clients",  () => HttpResponse.json<ClientStats>(clientStats)),
  http.get("/api/versions/policy",   () => HttpResponse.json<UpdatePolicy>(policy)),
  http.put("/api/versions/policy", async ({ request }) => {
    policy = await request.json() as UpdatePolicy
    return HttpResponse.json<UpdatePolicy>(policy)
  }),
  http.post("/api/versions/push", async () => {
    await new Promise((r) => setTimeout(r, 1000))
    return HttpResponse.json({ status: "ok", pushed: clientStats.pendingClients })
  }),
  http.post("/api/versions/update", async () => {
    await new Promise((r) => setTimeout(r, 1500))
    return HttpResponse.json({ status: "ok" })
  }),
  http.get("/api/versions/history", () => HttpResponse.json<UpdateRecord[]>(history)),
]
