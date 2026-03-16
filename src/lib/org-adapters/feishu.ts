/**
 * 飞书适配器
 *
 * 原生类型来源：飞书开放平台 contact v3 API
 * - 部门：GET /open-apis/contact/v3/departments/:department_id
 * - 成员：GET /open-apis/contact/v3/users/:user_id
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

export interface FeishuDeptI18nName {
  zh_cn?: string;
  ja_jp?: string;
  en_us?: string;
}

export interface FeishuDeptLeader {
  leader_type: 1 | 2; // 1=直属负责人 2=虚线负责人
  leader_id: string;
}

export interface FeishuDept {
  department_id: string;
  open_department_id?: string;
  name: string;
  i18n_name?: FeishuDeptI18nName;
  parent_department_id?: string; // "0" 表示根
  leader_user_id?: string;
  leaders?: FeishuDeptLeader[];
  chat_id?: string;
  order?: number;
  unit_ids?: string[];          // 所属业务单元
  member_count?: number;
  primary_member_count?: number;
  department_hrbps?: string[];  // HRBP 列表（飞书专属）
}

export interface FeishuUserStatus {
  is_frozen?: boolean;    // 被冻结
  is_resigned?: boolean;  // 已离职
  is_activated?: boolean; // 已激活
  is_exited?: boolean;    // 已退出
  is_unjoin?: boolean;    // 已邀请未加入
}

export interface FeishuUserOrder {
  department_id: string;
  user_order?: number;
  department_order?: number;
  is_primary_dept?: boolean;
}

export interface FeishuUserPosition {
  position_code?: string;
  position_name?: string;
  department_id?: string;
  is_major?: boolean;
}

export interface FeishuCustomAttr {
  id?: string;
  type?: string;
  value?: { text?: string; url?: string };
}

export interface FeishuUser {
  user_id: string;
  open_id?: string;
  union_id?: string;
  name: string;
  en_name?: string;
  nickname?: string;
  email?: string;
  mobile?: string;
  mobile_visible?: boolean;
  gender?: 0 | 1 | 2;     // 0=未知 1=男 2=女
  avatar?: { avatar_origin?: string; avatar_72?: string };
  status?: FeishuUserStatus;
  department_ids: string[];
  leader_user_id?: string;
  dotted_line_leader_user_ids?: string[];
  city?: string;
  join_time?: number;      // 入职时间戳（秒）
  is_tenant_manager?: boolean;
  employee_no?: string;    // 工号
  employee_type?: 1 | 2 | 3 | 4 | 5; // 1正式 2实习 3外包 4劳务 5顾问
  job_title?: string;      // 职称字符串
  job_level_id?: string;   // 职级 FK
  job_family_id?: string;
  enterprise_email?: string;
  description?: string;
  time_zone?: string;
  orders?: FeishuUserOrder[];
  positions?: FeishuUserPosition[];
  custom_attrs?: FeishuCustomAttr[];
}

// ── 映射辅助 ─────────────────────────────────

function toFeishuMemberStatus(status: FeishuUserStatus | undefined): MemberStatus {
  if (!status) return "active";
  if (status.is_resigned) return "resigned";
  if (status.is_exited) return "exited";
  if (status.is_frozen) return "disabled";
  if (status.is_unjoin) return "pending";
  if (status.is_activated) return "active";
  return "pending";
}

const FEISHU_EMPLOYEE_TYPE_MAP: Record<number, EmployeeType> = {
  1: "regular",
  2: "intern",
  3: "outsourced",
  4: "contractor",
  5: "consultant",
};

function toFeishuEmployeeType(t: number | undefined): EmployeeType {
  return FEISHU_EMPLOYEE_TYPE_MAP[t ?? 1] ?? "regular";
}

function toFeishuGender(g: 0 | 1 | 2 | undefined): OrgMember["gender"] {
  if (g === 1) return "male";
  if (g === 2) return "female";
  return "unknown";
}

function toFeishuMemberships(user: FeishuUser): MemberDeptMembership[] {
  return user.department_ids.map((deptId) => {
    const order = user.orders?.find((o) => o.department_id === deptId);
    return {
      departmentId: deptId,
      isPrimary: order?.is_primary_dept ?? false,
      isLeader: false, // 飞书的 leader 标注在 Department.leaders，不在 User 上
      sortOrder: order?.user_order,
    };
  });
}

// ── 适配器 ───────────────────────────────────

export const feishuAdapter: OrgAdapter<FeishuDept, FeishuUser> = {
  platform: "feishu",

  toDepartment(native: FeishuDept, orgUnitId: string): Department {
    const leaders: DeptLeader[] = [];

    // 优先使用 leaders[] 数组（含虚实线类型）
    if (native.leaders && native.leaders.length > 0) {
      for (const l of native.leaders) {
        leaders.push({
          userId: l.leader_id,
          leaderType: l.leader_type === 2 ? "dotted_line" : "solid_line",
        });
      }
    } else if (native.leader_user_id) {
      leaders.push({ userId: native.leader_user_id, leaderType: "solid_line" });
    }

    const isRoot =
      !native.parent_department_id || native.parent_department_id === "0";

    return {
      id: native.department_id,
      name: native.name,
      nameI18n: native.i18n_name
        ? {
            zhCn: native.i18n_name.zh_cn,
            enUs: native.i18n_name.en_us,
            jaJp: native.i18n_name.ja_jp,
          }
        : undefined,
      parentId: isRoot ? undefined : native.parent_department_id,
      orgUnitId,
      leaders,
      sortOrder: native.order ?? 0,
      isActive: true,
      chatId: native.chat_id,
      unitIds: native.unit_ids,
      hrbpUserIds: native.department_hrbps,
      memberCount: native.member_count,
      primaryMemberCount: native.primary_member_count,
      externalIds: {
        feishu: native.department_id,
        ...(native.open_department_id
          ? { internal: native.open_department_id }
          : {}),
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  toMember(native: FeishuUser): OrgMember {
    const memberships = toFeishuMemberships(native);
    const primaryMembership =
      memberships.find((m) => m.isPrimary) ?? memberships[0];

    const customAttributes = native.custom_attrs
      ?.filter((a) => a.id && a.value)
      .map((a) => ({
        key: a.id!,
        type: a.type === "url" ? ("url" as const) : ("text" as const),
        value: a.value?.text ?? a.value?.url ?? "",
      }));

    return {
      id: native.user_id,
      loginName: native.user_id,
      globalId: native.union_id,
      name: native.name,
      englishName: native.en_name,
      nickname: native.nickname,
      avatar: native.avatar?.avatar_72 ?? native.avatar?.avatar_origin,
      mobile: native.mobile,
      hideMobile: native.mobile_visible === false,
      email: native.email,
      enterpriseEmail: native.enterprise_email,
      workLocation: native.city,
      timeZone: native.time_zone,
      status: toFeishuMemberStatus(native.status),
      employeeType: toFeishuEmployeeType(native.employee_type),
      primaryDeptId: primaryMembership?.departmentId ?? "",
      departmentMemberships: memberships,
      managerUserId: native.leader_user_id,
      dottedLineManagerIds: native.dotted_line_leader_user_ids,
      jobTitleText: native.job_title,
      jobLevelId: native.job_level_id,
      employeeNo: native.employee_no,
      gender: toFeishuGender(native.gender),
      isTenantAdmin: native.is_tenant_manager ?? false,
      hiredAt: native.join_time
        ? new Date(native.join_time * 1000).toISOString()
        : undefined,
      externalIds: {
        feishu: native.user_id,
        ...(native.union_id ? { internal: native.union_id } : {}),
      },
      customAttributes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },
};
