/**
 * 钉钉适配器
 *
 * 原生类型来源：钉钉开放平台 v2 API
 * - 部门：POST /topapi/v2/department/get → DingDept
 * - 成员：POST /topapi/v2/user/get → DingUser
 */

import type {
  Department,
  DeptLeader,
  EmployeeType,
  ExternalIdMap,
  MemberDeptMembership,
  MemberStatus,
  OrgAdapter,
  OrgMember,
} from "@/types/org";

// ── 原生类型 ─────────────────────────────────

export interface DingDept {
  dept_id: number;
  name: string;
  parent_id: number;
  source_identifier?: string; // 外部同步 key
  order?: number;
  brief?: string;
  dept_manager_userid_list?: string[]; // 多个负责人
  hide_dept?: boolean;
  dept_group_chat_id?: string;
  outer_dept?: boolean;
}

export interface DingLeaderInDept {
  dept_id: number;
  leader: boolean;
}

export interface DingDeptOrder {
  dept_id: number;
  order: number;
}

export interface DingRole {
  id: number;
  name: string;
  group_id?: number;
}

export interface DingUser {
  userid: string;
  unionid?: string;
  name: string;
  avatar?: string;
  mobile?: string;
  hide_mobile?: boolean;
  telephone?: string;
  job_number?: string;   // 工号
  title?: string;        // 职称（字符串）
  email?: string;
  org_email?: string;
  work_place?: string;
  remark?: string;
  dept_id_list: number[];
  dept_order_list?: DingDeptOrder[];
  leader_in_dept?: DingLeaderInDept[];
  manager_userid?: string;
  hired_date?: number;   // ms timestamp
  active?: boolean;
  admin?: boolean;
  boss?: boolean;
  senior?: boolean;      // 隐私保护
  extension?: string;    // JSON 自定义字段
  role_list?: DingRole[];
}

// ── 映射辅助 ─────────────────────────────────

function toDingMemberStatus(active: boolean | undefined): MemberStatus {
  return active === false ? "disabled" : "active";
}

/** 钉钉无 employee_type 字段，统一视为正式员工 */
function toDingEmployeeType(): EmployeeType {
  return "regular";
}

function toDingMemberships(user: DingUser): MemberDeptMembership[] {
  return user.dept_id_list.map((deptId, index) => {
    const leaderEntry = user.leader_in_dept?.find((l) => l.dept_id === deptId);
    const orderEntry = user.dept_order_list?.find((o) => o.dept_id === deptId);
    return {
      departmentId: String(deptId),
      isPrimary: index === 0, // 钉钉以第一个为主部门
      isLeader: leaderEntry?.leader ?? false,
      leaderType: "solid_line" as const,
      sortOrder: orderEntry?.order,
    };
  });
}

// ── 适配器 ───────────────────────────────────

export const dingtalkAdapter: OrgAdapter<DingDept, DingUser> = {
  platform: "dingtalk",

  toDepartment(native: DingDept, orgUnitId: string): Department {
    const leaders: DeptLeader[] = (native.dept_manager_userid_list ?? []).map(
      (uid) => ({ userId: uid, leaderType: "solid_line" })
    );

    const externalIds: ExternalIdMap = { dingtalk: String(native.dept_id) };
    if (native.source_identifier) {
      externalIds["internal"] = native.source_identifier;
    }

    return {
      id: String(native.dept_id),
      name: native.name,
      description: native.brief,
      parentId:
        native.parent_id && native.parent_id !== 1
          ? String(native.parent_id)
          : undefined,
      orgUnitId,
      leaders,
      sortOrder: native.order ?? 0,
      isActive: true,
      isHidden: native.hide_dept,
      chatId: native.dept_group_chat_id,
      externalIds,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  toMember(native: DingUser): OrgMember {
    const memberships = toDingMemberships(native);
    const primaryMembership = memberships[0];

    let customAttributes = undefined;
    if (native.extension) {
      try {
        const ext = JSON.parse(native.extension) as Record<string, string>;
        customAttributes = Object.entries(ext).map(([key, value]) => ({
          key,
          type: "text" as const,
          value: String(value),
        }));
      } catch {
        // ignore malformed extension
      }
    }

    return {
      id: native.userid,
      loginName: native.userid,
      globalId: native.unionid,
      name: native.name,
      avatar: native.avatar,
      mobile: native.mobile,
      hideMobile: native.hide_mobile,
      telephone: native.telephone,
      email: native.email,
      enterpriseEmail: native.org_email,
      workLocation: native.work_place,
      status: toDingMemberStatus(native.active),
      employeeType: toDingEmployeeType(),
      primaryDeptId: primaryMembership?.departmentId ?? "",
      departmentMemberships: memberships,
      managerUserId: native.manager_userid,
      jobTitleText: native.title,
      employeeNo: native.job_number,
      isTenantAdmin: native.admin ?? false,
      isHidden: native.senior,
      hiredAt: native.hired_date
        ? new Date(native.hired_date).toISOString()
        : undefined,
      externalIds: { dingtalk: native.userid },
      customAttributes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },
};
