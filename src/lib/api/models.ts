import { get, put } from "./client";
import type { ModelConfig, UsageStat } from "@/types/model";

export const getModelConfigs = () =>
  get<ModelConfig[]>("/api/models/config");

export const saveModelConfig = (configs: ModelConfig[]) =>
  put<ModelConfig[]>("/api/models/config", configs);

export const getModelUsage = (days: number) =>
  get<UsageStat[]>("/api/models/usage", { days });
