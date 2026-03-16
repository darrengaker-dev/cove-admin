/**
 * 企业微信适配器
 *
 * 原生类型来源：企业微信服务端 API
 * - 部门：GET /cgi-bin/department/list
 * - 成员：GET /cgi-bin/user/get
 *
 * 注意：企微使用并行数组设计（department[] / order[] / is_leader_in_dept[] 索引对应）
 */

import type {
  Department,
  DeptLeader,
  EmployeeType,
  MemberDeptMembership,
  MemberStatus,
  OrgAdapter,
  OrgMember,
} from "@/types/org";

// ── 原生类型 ─────────────────────────────────

export interface WecomDept {
  id: number;
  name: string;
  name_en?: string;
  department_leader?: string[]; // 多负责人 userid 列表
  parentid: number;             // 0 或 1 表示根
  order?: number;
}

export interface WecomExtAttr {
  type: 0 | 1;  // 0=text 1=web
  name: string;
  text?: { value: string };
  web?: { url: string; title: string };
}

export interface WecomUser {
  userid: string;
  open_userid?: string;   // 第三方应用全局 ID
  name: string;
  alias?: string;         // 别名
  mobile?: string;
  department: number[];   // 并行数组 ①
  order?: number[];        // 并行数组 ②
  is_leader_in_dept?: number[]; // 并行数组 ③，1=是负责人
  position?: string;      // 职称字符串
  gender?: "1" | "2";    // "1"=男 "2"=女
  email?: string;
  biz_mail?: string;      // 企业邮箱
  is_senior?: number;     // 1=开启隐私保护
  enable?: 0 | 1;         // 1=启用 0=停用
  /**
   * status：
   *   1 = 已激活
   *   2 = 已禁用
   *   4 = 未激活
   *   5 = 退出企业
   */
  status?: 1 | 2 | 4 | 5;
  avatar?: string;
  thumb_avatar?: string;
  telephone?: string;
  address?: string;
  main_department?: number; // 主部门（企微专属明确字段）
  english_name?: string;
  hide_mobile?: number;   // 1=对外隐藏手机
  direct_leader?: string[]; // 直属上级 userid 列表（最多5个）
  extattr?: { attrs?: WecomExtAttr[] };
}

// ── 映射辅助 ─────────────────────────────────

function toWecomMemberStatus(user: WecomUser): MemberStatus {
  if (user.enable === 0) return "disabled";
  switch (user.status) {
    case 1: return "active";
    case 2: return "disabled";
    case 4: return "pending";
    case 5: return "resigned";
    default: return "active";
  }
}

/** 企微无 employee_type，统一为正式员工 */
function toWecomEmployeeType(): EmployeeType {
  return "regular";
}

function toWecomMemberships(user: WecomUser): MemberDeptMembership[] {
  return user.department.map((deptId, index) => ({
    departmentId: String(deptId),
    isPrimary: user.main_department === deptId,
    isLeader: (user.is_leader_in_dept?.[index] ?? 0) === 1,
    leaderType: "solid_line" as const,
    sortOrder: user.order?.[index],
  }));
}

function toWecomGender(g: "1" | "2" | undefined): OrgMember["gender"] {
  if (g === "1") return "male";
  if (g === "2") return "female";
  return "unknown";
}

// ── 适配器 ───────────────────────────────────

export const wecomAdapter: OrgAdapter<WecomDept, WecomUser> = {
  platform: "wecom",

  toDepartment(native: WecomDept, orgUnitId: string): Department {
    const leaders: DeptLeader[] = (native.department_leader ?? []).map(
      (uid) => ({ userId: uid, leaderType: "solid_line" })
    );

    // 企微根部门 parentid 为 0 或 1
    const isRoot = native.parentid === 0 || native.parentid === 1;

    return {
      id: String(native.id),
      name: native.name,
      nameI18n: native.name_en ? { enUs: native.name_en } : undefined,
      parentId: isRoot ? undefined : String(native.parentid),
      orgUnitId,
      leaders,
      sortOrder: native.order ?? 0,
      isActive: true,
      externalIds: { wecom: String(native.id) },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  toMember(native: WecomUser): OrgMember {
    const memberships = toWecomMemberships(native);

    // 主部门：优先使用 main_department，回退到第一个
    const primaryDeptId =
      native.main_department != null
        ? String(native.main_department)
        : (memberships[0]?.departmentId ?? "");

    const customAttributes = native.extattr?.attrs?.map((attr) => ({
      key: attr.name,
      type: attr.type === 1 ? ("url" as const) : ("text" as const),
      value: attr.type === 1 ? (attr.web?.url ?? "") : (attr.text?.value ?? ""),
      displayName: attr.name,
    }));

    return {
      id: native.userid,
      loginName: native.userid,
      globalId: native.open_userid,
      name: native.name,
      englishName: native.english_name,
      nickname: native.alias,
      avatar: native.avatar,
      mobile: native.mobile,
      hideMobile: native.hide_mobile === 1,
      email: native.email,
      enterpriseEmail: native.biz_mail,
      telephone: native.telephone,
      workLocation: native.address,
      status: toWecomMemberStatus(native),
      employeeType: toWecomEmployeeType(),
      primaryDeptId,
      departmentMemberships: memberships,
      managerUserId: native.direct_leader?.[0], // 取第一个直属上级
      jobTitleText: native.position,
      gender: toWecomGender(native.gender),
      isTenantAdmin: false, // 企微管理员通过单独 API 获取
      isHidden: native.is_senior === 1,
      externalIds: {
        wecom: native.userid,
        ...(native.open_userid ? { internal: native.open_userid } : {}),
      },
      customAttributes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },
};
