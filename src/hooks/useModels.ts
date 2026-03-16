import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getModelConfigs, saveModelConfig, getModelUsage } from "@/lib/api/models";
import type { ModelConfig, Platform, PlatformAccount, PlatformModel } from "@/types/model";

const api = (path: string, init?: RequestInit) => fetch(path, init).then((r) => r.json());

// ── 旧接口（保留）────────────────────────────────────

export function useModelConfigs() {
  return useQuery({ queryKey: ["models", "config"], queryFn: getModelConfigs });
}

export function useSaveModelConfigs() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (configs: ModelConfig[]) => saveModelConfig(configs),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["models", "config"] }),
  });
}

export function useModelUsage(days: number) {
  return useQuery({ queryKey: ["models", "usage", days], queryFn: () => getModelUsage(days) });
}

// ── 平台 ─────────────────────────────────────────────

export function usePlatforms() {
  return useQuery<Platform[]>({ queryKey: ["platforms"], queryFn: () => api("/api/platforms") });
}

export function useCreatePlatform() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Omit<Platform, "id" | "modelCount" | "clientModelCount">) =>
      fetch("/api/platforms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["platforms"] }),
  });
}

export function useUpdatePlatform() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: Partial<Platform> & { id: string }) =>
      fetch(`/api/platforms/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["platforms"] }),
  });
}

export function useDeletePlatform() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetch(`/api/platforms/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["platforms"] }),
  });
}

// ── 账号 ─────────────────────────────────────────────

export function usePlatformAccounts(platformId: string) {
  return useQuery<PlatformAccount[]>({
    queryKey: ["platforms", platformId, "accounts"],
    queryFn: () => api(`/api/platforms/${platformId}/accounts`),
    enabled: !!platformId,
  });
}

export function useCreateAccount(platformId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Omit<PlatformAccount, "id" | "platformId">) =>
      fetch(`/api/platforms/${platformId}/accounts`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["platforms", platformId, "accounts"] }),
  });
}

export function useDeleteAccount(platformId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetch(`/api/platforms/${platformId}/accounts/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["platforms", platformId, "accounts"] }),
  });
}

// ── 模型 ─────────────────────────────────────────────

export function usePlatformModels(platformId: string) {
  return useQuery<PlatformModel[]>({
    queryKey: ["platforms", platformId, "models"],
    queryFn: () => api(`/api/platforms/${platformId}/models`),
    enabled: !!platformId,
  });
}

export function useCreateModel(platformId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Omit<PlatformModel, "id" | "platformId">) =>
      fetch(`/api/platforms/${platformId}/models`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["platforms", platformId, "models"] });
      qc.invalidateQueries({ queryKey: ["platforms"] });
    },
  });
}

export function useUpdateModel(platformId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: Partial<PlatformModel> & { id: string }) =>
      fetch(`/api/platforms/${platformId}/models/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["platforms", platformId, "models"] });
      qc.invalidateQueries({ queryKey: ["platforms"] });
    },
  });
}

export function useDeleteModel(platformId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetch(`/api/platforms/${platformId}/models/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["platforms", platformId, "models"] });
      qc.invalidateQueries({ queryKey: ["platforms"] });
    },
  });
}
