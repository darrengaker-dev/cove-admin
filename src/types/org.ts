// FILE_SIZE_EXCEPTION: Universal org data model — covers 5 OA platforms (钉钉/飞书/企业微信/泛微/致远)

// ─────────────────────────────────────────────
// Platform & Sync
// ─────────────────────────────────────────────

export type PlatformType =
  | "dingtalk"  // 钉钉
  | "feishu"    // 飞书
  | "wecom"     // 企业微信
  | "weaver"    // 泛微
  | "seeyon"    // 致远
  | "internal"; // cove 内部

/**
 * 存储各平台的原生 ID，用于双向同步。
 * key 为 PlatformType，value 为该平台的原生 ID 字符串。
 * e.g. { dingtalk: "12345", feishu: "od-xxx", wecom: "dept_001" }
 */
export type ExternalIdMap = Partial<Record<PlatformType, string>>;

export type SyncStatus = "synced" | "pending" | "conflict" | "error";

/** 记录某个实体与某个外部平台的同步状态 */
export interface SyncRecord {
  entityType: "org_unit" | "department" | "post" | "member" | "role";
  entityId: string;
  platform: PlatformType;
  externalId: string;
  lastSyncAt: string;
  syncStatus: SyncStatus;
  errorMessage?: string;
}

// ─────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────

/**
 * 统一成员状态
 *
 * | 状态       | 钉钉          | 飞书                 | 企微         | 泛微       | 致远       |
 * |------------|---------------|----------------------|--------------|------------|------------|
 * | active     | active=true   | is_activated=true    | status=1     | status=0   | status=0   |
 * | pending    | —             | is_unjoin=true       | status=4     | status=1   | —          |
 * | disabled   | active=false  | is_frozen=true       | status=2     | status=3   | status=1   |
 * | resigned   | —             | is_resigned=true     | status=5     | status=2   | status=2   |
 * | retired    | —             | —                    | —            | status=5   | —          |
 * | exited     | —             | is_exited=true       | —            | —          | —          |
 */
export type MemberStatus =
  | "active"    // 在职/已激活
  | "pending"   // 待激活/试用
  | "disabled"  // 已禁用/冻结
  | "resigned"  // 已离职
  | "retired"   // 已退休（泛微）
  | "exited";   // 已退出组织（飞书）

/**
 * 统一员工类型
 *
 * | 类型        | 飞书 employee_type | 泛微 resourcetype |
 * |-------------|-------------------|------------------|
 * | regular     | 1                 | 1                |
 * | intern      | 2                 | —                |
 * | outsourced  | 3                 | —                |
 * | contractor  | 4                 | —                |
 * | consultant  | 5                 | —                |
 * | external    | —                 | 2                |
 * | virtual     | —                 | 3                |
 */
export type EmployeeType =
  | "regular"      // 正式员工
  | "intern"       // 实习生
  | "outsourced"   // 外包
  | "contractor"   // 劳务/合同工
  | "consultant"   // 顾问
  | "external"     // 外部用户
  | "virtual";     // 虚拟人员

/** 部门负责人类型（飞书 leader_type） */
export type LeaderType = "solid_line" | "dotted_line";

// ─────────────────────────────────────────────
// Reference Entities
// ─────────────────────────────────────────────

/**
 * 自定义属性（各平台扩展字段的统一表达）
 * 对应：钉钉 extension JSON、飞书 custom_attrs、企微 extattr、泛微自定义字段
 */
export interface CustomAttribute {
  key: string;
  displayName?: string;
  type: "text" | "url" | "date" | "number" | "enum";
  value: string;
}

/**
 * 职务 / 岗位参考实体（泛微 HrmJobTitles）
 * 其他平台存为字符串字段，此处统一为可选引用
 */
export interface JobTitle {
  id: string;
  name: string;
  code?: string;
  organizationId?: string;
  externalIds: ExternalIdMap;
}

/**
 * 职级参考实体（飞书 job_level_id、致远 OrgLevel）
 * rank 越小级别越低
 */
export interface JobLevel {
  id: string;
  name: string;       // e.g. "P6", "M3", "高级工程师"
  code?: string;
  rank?: number;      // 数值排序，越大级别越高
  organizationId?: string;
  externalIds: ExternalIdMap;
}

// ─────────────────────────────────────────────
// Organization Unit（组织层级节点）
// ─────────────────────────────────────────────

/**
 * 组织节点：覆盖以下平台概念
 * - 泛微 HrmSubCompany（分部/子公司，位于 Company 和 Department 之间）
 * - 致远 OrgAccount（单位，Department 的上级容器）
 * - 飞书 unit（业务单元，横向虚拟维度）
 * - 钉钉/企微的 Corp 本身（type = "root"）
 *
 * type 区分在树中的语义角色：
 *   root        → 顶层企业/租户（对应各平台的 corpId / tenantId）
 *   branch      → 子公司/分部（泛微 SubCompany、致远多层 Account）
 *   unit        → 飞书业务单元（横向，不参与树形层级）
 */
export interface OrgUnit {
  id: string;
  name: string;
  shortName?: string;
  code?: string;
  description?: string;
  type: "root" | "branch" | "unit";
  parentId?: string;      // 指向同类型 OrgUnit
  sortOrder: number;
  isActive: boolean;
  externalIds: ExternalIdMap;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────
// Department（部门）
// ─────────────────────────────────────────────

/** 部门负责人（支持多负责人和虚实线区分，对应飞书 leaders[]） */
export interface DeptLeader {
  userId: string;
  leaderType: LeaderType;
}

/**
 * 通用部门
 *
 * 设计原则：
 * - parentId 为 null 表示该部门挂在 orgUnitId 节点下的根部门
 * - orgUnitId 指向所属 OrgUnit（泛微 subcompanyid1、致远 accountId）
 * - leaders[] 支持多负责人 + 虚实线类型（飞书），单负责人平台仅填 leaders[0]
 * - hrbpUserIds / unitIds 为飞书独有字段，其他平台留空
 */
export interface Department {
  id: string;
  name: string;
  nameI18n?: {
    zhCn?: string;
    enUs?: string;
    jaJp?: string;
  };
  code?: string;
  description?: string;

  // 层级
  parentId?: string;      // 父部门 ID（同级树），null 表示根
  orgUnitId: string;      // 所属 OrgUnit（泛微分部 / 致远单位 / 顶层根节点）

  // 负责人
  leaders: DeptLeader[];  // 飞书多负责人；单负责人平台仅含一项

  // 排序
  sortOrder: number;

  // 状态
  isActive: boolean;
  isHidden?: boolean;     // 钉钉 hide_dept

  // 飞书专属
  hrbpUserIds?: string[]; // HRBP 负责人列表
  unitIds?: string[];     // 所属业务单元（飞书 unit_ids，横向维度）

  // 聊天集成（钉钉 / 飞书）
  chatId?: string;

  // 统计
  memberCount?: number;
  primaryMemberCount?: number; // 以此部门为主部门的人数

  externalIds: ExternalIdMap;
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────
// Post（岗位）
// ─────────────────────────────────────────────

/**
 * 岗位：致远 OrgPost 的一等实体概念
 * 其他平台无独立岗位实体，相关信息退化为 OrgMember.jobTitleText 字符串
 *
 * 岗位归属于某个部门，成员通过 MemberDeptMembership.postId 关联
 */
export interface Post {
  id: string;
  name: string;
  code?: string;
  departmentId: string;
  orgUnitId: string;
  sortOrder: number;
  isActive: boolean;
  externalIds: ExternalIdMap;
}

// ─────────────────────────────────────────────
// Member（成员 / 用户）
// ─────────────────────────────────────────────

/**
 * 成员在某个部门的从属关系
 *
 * 支持三种平台设计：
 * 1. 多部门对象数组（钉钉 leader_in_dept[]、飞书 orders[]）
 * 2. 多部门并行数组（企微 department[] + is_leader_in_dept[]）
 * 3. 单部门（泛微 departmentid，此时只有一条 membership）
 * 4. 岗位中心（致远 OrgMemberPost，通过 postId 关联）
 */
export interface MemberDeptMembership {
  departmentId: string;
  isPrimary: boolean;     // 是否为主部门
  isLeader: boolean;      // 是否为部门负责人
  leaderType?: LeaderType; // 负责人类型（飞书实线/虚线）
  postId?: string;        // 所在岗位（致远）
  sortOrder?: number;     // 在该部门内的排序
}

/**
 * 通用成员（OrgMember）
 *
 * 字段对照表（主要平台）：
 *
 * | 本模型字段       | 钉钉            | 飞书              | 企微          | 泛微          | 致远           |
 * |------------------|-----------------|-------------------|---------------|---------------|----------------|
 * | loginName        | userid          | user_id           | userid        | loginid       | loginName      |
 * | globalId         | unionid         | union_id          | open_userid   | —             | —              |
 * | name             | name            | name              | name          | lastname      | name           |
 * | employeeNo       | job_number      | employee_no       | —             | workcode      | employeeCode   |
 * | jobTitleText     | title           | job_title         | position      | —(FK)         | —(FK)          |
 * | jobTitleId       | —               | —                 | —             | jobtitleid    | postId(FK)     |
 * | jobLevelId       | —               | job_level_id      | —             | —             | levelId        |
 * | managerUserId    | manager_userid  | leader_user_id    | direct_leader | —             | —              |
 * | primaryDeptId    | dept_id_list[0] | (is_primary_dept) | main_dept     | departmentid  | (isPrimary)    |
 * | primaryOrgUnitId | —               | —                 | —             | subcompanyid1 | accountId      |
 * | status           | active          | UserStatus        | enable+status | status        | status         |
 * | employeeType     | —               | employee_type     | —             | resourcetype  | type           |
 */
export interface OrgMember {
  id: string;

  // 身份
  loginName: string;      // 登录账号（各平台 userid / loginid / loginName）
  globalId?: string;      // 跨应用全局 ID（钉钉 unionid、飞书 union_id、企微 open_userid）

  // 姓名
  name: string;
  englishName?: string;
  nickname?: string;      // 飞书 nickname

  // 联系方式
  mobile?: string;
  hideMobile?: boolean;
  email?: string;
  enterpriseEmail?: string; // 企业邮箱（飞书 enterprise_email、企微 biz_mail）
  telephone?: string;

  // 状态与类型
  status: MemberStatus;
  employeeType: EmployeeType;

  // 组织归属
  primaryDeptId: string;        // 主部门 ID
  primaryOrgUnitId?: string;    // 主 OrgUnit（泛微 subcompanyid1、致远 accountId）
  primaryPostId?: string;       // 主岗位（致远 postId）
  departmentMemberships: MemberDeptMembership[]; // 全部部门从属（含主部门）

  // 管理链
  managerUserId?: string;          // 直接上级
  dottedLineManagerIds?: string[]; // 虚线上级（飞书专属）

  // 职务与职级
  jobTitleText?: string;   // 职称字符串（钉钉 title / 飞书 job_title / 企微 position）
  jobTitleId?: string;     // 职务 FK（泛微 jobtitleid）
  jobLevelId?: string;     // 职级 FK（飞书 job_level_id / 致远 levelId）

  // 个人信息
  gender?: "male" | "female" | "unknown";
  birthday?: string;
  avatar?: string;
  workLocation?: string;
  timeZone?: string;

  // 管理标志
  isTenantAdmin: boolean;
  isHidden?: boolean;     // 隐私保护（飞书 senior）

  // 入职
  employeeNo?: string;    // 工号
  hiredAt?: string;       // 入职时间

  externalIds: ExternalIdMap;
  customAttributes?: CustomAttribute[];
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────
// Role（权限角色）
// ─────────────────────────────────────────────

/**
 * 角色组（钉钉 RoleGroup 的两级结构）
 * 其他平台无角色组概念，可将所有角色归入一个默认 group
 */
export interface RoleGroup {
  id: string;
  name: string;
  orgUnitId?: string;
  externalIds: ExternalIdMap;
}

export interface Role {
  id: string;
  name: string;
  groupId?: string;     // 所属角色组
  description?: string;
  permissions?: string[];
  externalIds: ExternalIdMap;
}

export interface MemberRole {
  memberId: string;
  roleId: string;
  scope?: "global" | "department" | "post";
  scopeId?: string;     // 对应 scope 的 ID
}

// ─────────────────────────────────────────────
// Adapter Interface（适配器契约）
// ─────────────────────────────────────────────

/**
 * 每个平台适配器需实现此接口，将平台原生类型转换为通用模型。
 * T = 平台原生部门类型
 * U = 平台原生成员类型
 */
export interface OrgAdapter<T, U> {
  platform: PlatformType;
  toDepartment(native: T, orgUnitId: string): Department;
  toMember(native: U): OrgMember;
  fromDepartment?(dept: Department): T;
  fromMember?(member: OrgMember): U;
}
