/**
 * 致远（Seeyon A8+）适配器
 *
 * 原生类型来源：致远 CTP Open Platform REST API
 * - 单位：GET /seeyon/open/orgAccount/list
 * - 部门：GET /seeyon/open/orgDepartment/list
 * - 岗位：GET /seeyon/open/orgPost/list
 * - 成员：GET /seeyon/open/orgMember/get/{id}
 * - 职级：GET /seeyon/open/orgLevel/list
 *
 * 关键特征：
 * 1. OrgAccount（单位）作为 Department 的上级容器（对应 OrgUnit type="branch"）
 * 2. OrgPost（岗位）是一等实体，成员通过 OrgMemberPost 关联部门+岗位
 * 3. OrgLevel（职级）独立实体（P6、M3 等）
 */

import type {
  Department,
  DeptLeader,
  EmployeeType,
  MemberDeptMembership,
  MemberStatus,
  OrgAdapter,
  OrgMember,
  OrgUnit,
  Post,
} from "@/types/org";

// ── 原生类型 ─────────────────────────────────

/** 单位（组织顶层节点，可多层嵌套） */
export interface SeeyonAccount {
  id: string;
  name: string;
  shortname?: string;
  code?: string;
  type?: number;
  parentId?: string;
  outerId?: string; // 外部同步 key
}

/** 部门 */
export interface SeeyonDept {
  id: string;
  name: string;
  code?: string;
  sortId?: number;
  parentId?: string;  // 父部门 ID（null 表示直挂在 Account 下）
  accountId: string;  // 所属单位 FK
  isValid?: boolean;
  description?: string;
  managerId?: string; // 部门负责人 OrgMember.id
  outerId?: string;
}

/** 岗位（致远一等实体） */
export interface SeeyonPost {
  id: string;
  name: string;
  code?: string;
  departmentId: string;
  accountId: string;
  sortId?: number;
  isValid?: boolean;
}

/** 职级 */
export interface SeeyonLevel {
  id: string;
  name: string;
  code?: string;
  accountId?: string;
}

/**
 * 成员
 *
 * status:
 *   0 = 正常（active）
 *   1 = 冻结（disabled）
 *   2 = 注销（resigned）
 */
export interface SeeyonMember {
  id: string;
  name: string;
  loginName: string;
  email?: string;
  mobile?: string;
  telephone?: string;
  sex?: 0 | 1;        // 0=女 1=男
  birthday?: string;
  employeeCode?: string; // 工号
  status?: 0 | 1 | 2;
  type?: number;
  levelId?: string;   // 职级 FK → SeeyonLevel
  accountId?: string; // 主单位 FK
  departmentId?: string; // 主部门 FK
  postId?: string;    // 主岗位 FK
  outerId?: string;
}

/**
 * 成员-岗位关联（OrgMemberPost 连接表）
 * 支持一人多岗位（含兼职）
 */
export interface SeeyonMemberPost {
  memberId: string;
  postId: string;
  departmentId: string;
  isPrimary?: boolean;
  sortId?: number;
}

// ── 辅助导出：Account → OrgUnit 转换 ─────────

export function seeyonAccountToOrgUnit(
  native: SeeyonAccount,
  rootOrgUnitId: string
): OrgUnit {
  return {
    id: native.id,
    name: native.name,
    shortName: native.shortname,
    code: native.code,
    type: "branch",
    parentId: native.parentId ?? rootOrgUnitId,
    sortOrder: 0,
    isActive: true,
    externalIds: {
      seeyon: native.id,
      ...(native.outerId ? { internal: native.outerId } : {}),
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/** 将 SeeyonPost 转为通用 Post 实体 */
export function seeyonPostToPost(native: SeeyonPost): Post {
  return {
    id: native.id,
    name: native.name,
    code: native.code,
    departmentId: native.departmentId,
    orgUnitId: native.accountId,
    sortOrder: native.sortId ?? 0,
    isActive: native.isValid !== false,
    externalIds: { seeyon: native.id },
  };
}

// ── 映射辅助 ─────────────────────────────────

const SEEYON_STATUS_MAP: Record<number, MemberStatus> = {
  0: "active",
  1: "disabled",
  2: "resigned",
};

function toSeeyonEmployeeType(type: number | undefined): EmployeeType {
  // 致远 member.type 无公开枚举，默认为正式员工
  // 如已知映射可在此扩展
  void type;
  return "regular";
}

function toSeeyonGender(sex: 0 | 1 | undefined): OrgMember["gender"] {
  if (sex === 1) return "male";
  if (sex === 0) return "female";
  return "unknown";
}

/**
 * 构建 MemberDeptMembership 列表
 * @param member    主成员记录（含 primaryDeptId / primaryPostId）
 * @param postList  该成员的全部 OrgMemberPost 记录（可选，用于多岗位场景）
 */
export function buildSeeyonMemberships(
  member: SeeyonMember,
  postList?: SeeyonMemberPost[]
): MemberDeptMembership[] {
  if (postList && postList.length > 0) {
    return postList.map((mp) => ({
      departmentId: mp.departmentId,
      isPrimary: mp.isPrimary ?? mp.postId === member.postId,
      isLeader: false,
      postId: mp.postId,
      sortOrder: mp.sortId,
    }));
  }
  // 无 OrgMemberPost 数据时退化为单部门
  if (member.departmentId) {
    return [
      {
        departmentId: member.departmentId,
        isPrimary: true,
        isLeader: false,
        postId: member.postId,
      },
    ];
  }
  return [];
}

// ── 适配器 ───────────────────────────────────

export const seeyonAdapter: OrgAdapter<SeeyonDept, SeeyonMember> = {
  platform: "seeyon",

  toDepartment(native: SeeyonDept, orgUnitId: string): Department {
    const leaders: DeptLeader[] = native.managerId
      ? [{ userId: native.managerId, leaderType: "solid_line" }]
      : [];

    return {
      id: native.id,
      name: native.name,
      code: native.code,
      description: native.description,
      parentId: native.parentId ?? undefined,
      orgUnitId,
      leaders,
      sortOrder: native.sortId ?? 0,
      isActive: native.isValid !== false,
      externalIds: {
        seeyon: native.id,
        ...(native.outerId ? { internal: native.outerId } : {}),
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  /**
   * 基础转换（单岗位）
   * 若需多岗位，请先调用 buildSeeyonMemberships(member, postList)
   * 再将结果覆盖 departmentMemberships 字段
   */
  toMember(native: SeeyonMember): OrgMember {
    const memberships = buildSeeyonMemberships(native);

    return {
      id: native.id,
      loginName: native.loginName,
      name: native.name,
      mobile: native.mobile,
      telephone: native.telephone,
      email: native.email,
      birthday: native.birthday,
      gender: toSeeyonGender(native.sex),
      status: SEEYON_STATUS_MAP[native.status ?? 0] ?? "active",
      employeeType: toSeeyonEmployeeType(native.type),
      primaryDeptId: native.departmentId ?? "",
      primaryOrgUnitId: native.accountId,
      primaryPostId: native.postId,
      departmentMemberships: memberships,
      jobLevelId: native.levelId,
      employeeNo: native.employeeCode,
      isTenantAdmin: false,
      externalIds: {
        seeyon: native.id,
        ...(native.outerId ? { internal: native.outerId } : {}),
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },
};
