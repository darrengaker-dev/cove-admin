/**
 * 泛微（Weaver OA / e-cology）适配器
 *
 * 原生类型来源：泛微 HRM 数据库表结构 / Open Platform REST API
 * - 分部：HrmSubCompany 表 / GET /api/hrm/emmanager/getSubCompanyInfo
 * - 部门：HrmDepartment 表 / GET /api/hrm/emmanager/getHrmDepartmentInfo
 * - 人员：HrmResource 表 / GET /api/hrm/emmanager/getHrmResourceInfo
 *
 * 关键特征：
 * 1. 三级层级：Company → SubCompany（分部）→ Department → User
 * 2. 用户单部门（departmentid 为单值，非数组）
 * 3. resourcetype 区分员工类型，status 有 6 种值
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
} from "@/types/org";

// ── 原生类型 ─────────────────────────────────

/** HrmSubCompany（分部/子公司） */
export interface WeaverSubCompany {
  id: number;
  subcompanyname: string;
  subcompanydesc?: string;
  subcompanycode?: string;
  supsubcomid?: number;   // 父分部 ID，0 表示根
  companyid?: number;
  showorder?: number;
  canceled?: 0 | 1;
}

/** HrmDepartment（部门） */
export interface WeaverDept {
  id: number;
  departmentname: string;
  departmentcode?: string;
  subcompanyid1: number;  // 所属分部 FK → SubCompany
  supdepid?: number;      // 父部门 ID，0 表示分部下根部门
  showorder?: number;
  departmentmark?: string;
  canceled?: 0 | 1;
  uuid?: string;          // 外部同步 UUID
  leader?: number;        // 负责人的 HrmResource.id
}

/**
 * HrmResource（人员）
 *
 * status:
 *   0 = 在职（active）
 *   1 = 试用（pending）
 *   2 = 离职（resigned）
 *   3 = 无效/禁用（disabled）
 *   4 = —（未使用）
 *   5 = 退休（retired）
 *
 * resourcetype:
 *   1 = 正式员工
 *   2 = 外部用户
 *   3 = 虚拟人员
 */
export interface WeaverResource {
  id: number;
  loginid: string;
  lastname: string;       // 姓名（中文系统用 lastname 存全名）
  sex?: "M" | "F";
  birthday?: string;
  mobile?: string;
  telephone?: string;
  email?: string;
  status?: 0 | 1 | 2 | 3 | 5;
  subcompanyid1?: number; // 主分部 FK
  departmentid: number;   // 主部门 FK（单值）
  jobtitleid?: number;    // 职务 FK → HrmJobTitles
  joblevel?: number;      // 职级 ID
  workcode?: string;      // 工号
  resourcetype?: 1 | 2 | 3;
  outkey?: string;        // 外部同步 key
  createdate?: string;
  seclevel?: number;      // 密级
}

// ── 辅助导出：SubCompany → OrgUnit 转换 ──────

/**
 * 将 WeaverSubCompany 转为通用 OrgUnit（type="branch"）
 * 调用方传入根 rootOrgUnitId（对应 WeaverSubCompany.companyid）
 */
export function weaverSubCompanyToOrgUnit(
  native: WeaverSubCompany,
  rootOrgUnitId: string
): OrgUnit {
  const isRoot = !native.supsubcomid || native.supsubcomid === 0;
  return {
    id: String(native.id),
    name: native.subcompanyname,
    code: native.subcompanycode,
    description: native.subcompanydesc,
    type: "branch",
    parentId: isRoot ? rootOrgUnitId : String(native.supsubcomid),
    sortOrder: native.showorder ?? 0,
    isActive: native.canceled !== 1,
    externalIds: { weaver: String(native.id) },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// ── 映射辅助 ─────────────────────────────────

const WEAVER_STATUS_MAP: Record<number, MemberStatus> = {
  0: "active",
  1: "pending",
  2: "resigned",
  3: "disabled",
  5: "retired",
};

const WEAVER_RESOURCE_TYPE_MAP: Record<number, EmployeeType> = {
  1: "regular",
  2: "external",
  3: "virtual",
};

function toWeaverGender(sex: "M" | "F" | undefined): OrgMember["gender"] {
  if (sex === "M") return "male";
  if (sex === "F") return "female";
  return "unknown";
}

// ── 适配器 ───────────────────────────────────

export const weaverAdapter: OrgAdapter<WeaverDept, WeaverResource> = {
  platform: "weaver",

  toDepartment(native: WeaverDept, orgUnitId: string): Department {
    // orgUnitId 由调用方传入（对应 native.subcompanyid1 转换后的 OrgUnit.id）
    const leaders: DeptLeader[] = native.leader
      ? [{ userId: String(native.leader), leaderType: "solid_line" }]
      : [];

    const isRoot = !native.supdepid || native.supdepid === 0;

    return {
      id: String(native.id),
      name: native.departmentname,
      code: native.departmentcode,
      description: native.departmentmark,
      parentId: isRoot ? undefined : String(native.supdepid),
      orgUnitId,
      leaders,
      sortOrder: native.showorder ?? 0,
      isActive: native.canceled !== 1,
      externalIds: {
        weaver: String(native.id),
        ...(native.uuid ? { internal: native.uuid } : {}),
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  toMember(native: WeaverResource): OrgMember {
    // 泛微单部门：departmentMemberships 只有一条记录
    const membership: MemberDeptMembership = {
      departmentId: String(native.departmentid),
      isPrimary: true,
      isLeader: false, // 负责人标记在 Department.leader 上，成员侧无此标志
    };

    return {
      id: String(native.id),
      loginName: native.loginid,
      name: native.lastname,
      mobile: native.mobile,
      telephone: native.telephone,
      email: native.email,
      birthday: native.birthday,
      gender: toWeaverGender(native.sex),
      status: WEAVER_STATUS_MAP[native.status ?? 0] ?? "active",
      employeeType: WEAVER_RESOURCE_TYPE_MAP[native.resourcetype ?? 1] ?? "regular",
      primaryDeptId: String(native.departmentid),
      primaryOrgUnitId: native.subcompanyid1
        ? String(native.subcompanyid1)
        : undefined,
      departmentMemberships: [membership],
      jobTitleId: native.jobtitleid ? String(native.jobtitleid) : undefined,
      jobLevelId: native.joblevel ? String(native.joblevel) : undefined,
      employeeNo: native.workcode,
      isTenantAdmin: false,
      externalIds: {
        weaver: String(native.id),
        ...(native.outkey ? { internal: native.outkey } : {}),
      },
      createdAt: native.createdate ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },
};
