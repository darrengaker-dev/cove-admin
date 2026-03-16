/**
 * 组织适配器注册表
 *
 * 用法示例：
 *
 *   import { getAdapter, normalizeDept, normalizeMember } from "@/lib/org-adapters"
 *
 *   // 将钉钉原生部门转为通用模型
 *   const dept = normalizeDept("dingtalk", rawDingDept, orgUnitId)
 *
 *   // 将飞书原生成员转为通用模型
 *   const member = normalizeMember("feishu", rawFeishuUser)
 *
 *   // 直接获取适配器实例（用于批量处理）
 *   const adapter = getAdapter("wecom")
 */

import type { Department, OrgAdapter, OrgMember, PlatformType } from "@/types/org";

import { dingtalkAdapter } from "./dingtalk";
import { feishuAdapter } from "./feishu";
import { wecomAdapter } from "./wecom";
import { weaverAdapter } from "./weaver";
import { seeyonAdapter } from "./seeyon";

// ── 注册表 ───────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ADAPTERS: Record<Exclude<PlatformType, "internal">, OrgAdapter<any, any>> = {
  dingtalk: dingtalkAdapter,
  feishu: feishuAdapter,
  wecom: wecomAdapter,
  weaver: weaverAdapter,
  seeyon: seeyonAdapter,
};

// ── 工厂函数 ─────────────────────────────────

/**
 * 获取指定平台的适配器实例
 * @throws 若 platform 为 "internal" 或未注册则报错
 */
export function getAdapter(
  platform: Exclude<PlatformType, "internal">
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): OrgAdapter<any, any> {
  const adapter = ADAPTERS[platform];
  if (!adapter) throw new Error(`No adapter registered for platform: ${platform}`);
  return adapter;
}

/**
 * 将平台原生部门对象转为通用 Department
 * @param platform   平台标识
 * @param native     原生部门对象
 * @param orgUnitId  所属 OrgUnit 的通用 ID
 */
export function normalizeDept<T>(
  platform: Exclude<PlatformType, "internal">,
  native: T,
  orgUnitId: string
): Department {
  return getAdapter(platform).toDepartment(native, orgUnitId);
}

/**
 * 将平台原生成员对象转为通用 OrgMember
 * @param platform  平台标识
 * @param native    原生成员对象
 */
export function normalizeMember<U>(
  platform: Exclude<PlatformType, "internal">,
  native: U
): OrgMember {
  return getAdapter(platform).toMember(native);
}

/**
 * 批量转换部门列表
 */
export function normalizeDeptList<T>(
  platform: Exclude<PlatformType, "internal">,
  nativeList: T[],
  orgUnitId: string
): Department[] {
  const adapter = getAdapter(platform);
  return nativeList.map((d) => adapter.toDepartment(d, orgUnitId));
}

/**
 * 批量转换成员列表
 */
export function normalizeMemberList<U>(
  platform: Exclude<PlatformType, "internal">,
  nativeList: U[]
): OrgMember[] {
  const adapter = getAdapter(platform);
  return nativeList.map((u) => adapter.toMember(u));
}

// ── 重新导出所有适配器和辅助函数 ─────────────

export { dingtalkAdapter } from "./dingtalk";
export type { DingDept, DingUser } from "./dingtalk";

export { feishuAdapter } from "./feishu";
export type { FeishuDept, FeishuUser } from "./feishu";

export { wecomAdapter } from "./wecom";
export type { WecomDept, WecomUser } from "./wecom";

export { weaverAdapter, weaverSubCompanyToOrgUnit } from "./weaver";
export type { WeaverDept, WeaverResource, WeaverSubCompany } from "./weaver";

export { seeyonAdapter, seeyonAccountToOrgUnit, seeyonPostToPost, buildSeeyonMemberships } from "./seeyon";
export type { SeeyonDept, SeeyonMember, SeeyonAccount, SeeyonPost, SeeyonLevel, SeeyonMemberPost } from "./seeyon";
