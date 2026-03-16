import { get, post, put } from "./client"
import type { Role, CreateRoleRequest, UpdateRoleRequest, ThreeElementStatus } from "@/types/permissions"

const del = (url: string) =>
  fetch(url, { method: "DELETE", headers: { Authorization: `Bearer ${localStorage.getItem("admin_token")}` } }).then((r) => r.json())

export const getRoles           = ()                          => get<Role[]>("/api/permissions/roles")
export const getRole            = (id: string)                => get<Role>(`/api/permissions/roles/${id}`)
export const createRole         = (body: CreateRoleRequest)   => post<Role>("/api/permissions/roles", body)
export const updateRole         = (id: string, body: UpdateRoleRequest) => put<Role>(`/api/permissions/roles/${id}`, body)
export const deleteRole         = (id: string)                => del(`/api/permissions/roles/${id}`)
export const getThreeElement    = ()                          => get<ThreeElementStatus>("/api/permissions/three-element")
export const setThreeElementMode = (mode: string)             => put<ThreeElementStatus>("/api/permissions/three-element/mode", { mode })
