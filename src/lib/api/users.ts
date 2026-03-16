import { get, patch, post } from "./client";
import type { PaginatedResponse } from "@/types/common";
import type { User, UserFilter, BanUserRequest, ResetPasswordResponse } from "@/types/user";

export const getUsers = (filter: UserFilter) =>
  get<PaginatedResponse<User>>("/api/users", filter as unknown as Record<string, string | number | boolean | undefined>);

export const banUser = (id: string, body: BanUserRequest) =>
  patch<User>(`/api/users/${id}/ban`, body);

export const unbanUser = (id: string) =>
  patch<User>(`/api/users/${id}/unban`);

export const resetPassword = (id: string) =>
  post<ResetPasswordResponse>(`/api/users/${id}/reset-password`);
