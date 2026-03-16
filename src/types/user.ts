// 对齐 org 表结构的用户管理类型

export type MemberStatus = "active" | "disabled" | "resigned";
// 旧别名保持兼容
export type UserStatus = MemberStatus;

export interface OrgDept {
  id: string;
  name: string;
  code?: string;
  parentId?: string;
  memberCount: number;
  sortOrder: number;
  isActive: boolean;
}

export interface Member {
  id: string;
  loginName: string;        // 登录账号
  name: string;             // 姓名
  email?: string;
  mobile?: string;
  status: MemberStatus;
  primaryDeptId: string;
  primaryDeptName: string;  // 冗余展示用
  jobTitle?: string;        // 职称
  employeeNo?: string;      // 工号
  gender?: "male" | "female" | "unknown";
  hiredAt?: string;         // 入职时间
  isAdmin: boolean;
  managerName?: string;     // 直属上级姓名
}

// 旧别名保持兼容（BanUserDialog / ResetPasswordDialog 仍引用 User）
export type User = Member;

export interface MemberFilter {
  page: number;
  limit: number;
  search?: string;
  status?: MemberStatus;
  deptId?: string;
}

// 旧别名
export type UserFilter = MemberFilter;

export interface BanUserRequest {
  reason: string;
}

export interface ResetPasswordResponse {
  temporaryPassword: string;
}

// ── 注册审批 ──────────────────────────────────────────────
export type RegistrationStatus = "pending" | "approved" | "rejected"

export interface RegistrationRequest {
  id: string
  name: string
  loginName: string
  email: string
  requestedDeptId?: string
  requestedDeptName?: string
  message?: string
  registeredAt: string
  status: RegistrationStatus
  reviewNote?: string
}

// ── 自动审批规则 ────────────────────────────────────────────
export type AutoApprovalRuleType = "email_domain" | "email_prefix"

export interface AutoApprovalRule {
  id: string
  type: AutoApprovalRuleType
  value: string
  description?: string
  isEnabled: boolean
  createdAt: string
}

// ── 批量导入 ───────────────────────────────────────────────
export type ImportRowStatus = "ok" | "duplicate" | "error"

export interface ImportPreviewRow {
  rowNo: number
  name: string
  loginName: string
  email?: string
  mobile?: string
  deptName: string
  jobTitle?: string
  employeeNo?: string
  status: ImportRowStatus
  errorMsg?: string
}
