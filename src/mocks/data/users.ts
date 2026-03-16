import type { Member, MemberStatus, OrgDept } from "@/types/user";

// ── 部门树 mock 数据 ───────────────────────────────────

export const MOCK_DEPTS: OrgDept[] = [
  { id: "dept-tech",      name: "技术部",   code: "TECH",    parentId: undefined,      memberCount: 18, sortOrder: 1, isActive: true },
  { id: "dept-frontend",  name: "前端组",   code: "FE",      parentId: "dept-tech",    memberCount: 6,  sortOrder: 1, isActive: true },
  { id: "dept-backend",   name: "后端组",   code: "BE",      parentId: "dept-tech",    memberCount: 8,  sortOrder: 2, isActive: true },
  { id: "dept-qa",        name: "测试组",   code: "QA",      parentId: "dept-tech",    memberCount: 4,  sortOrder: 3, isActive: true },
  { id: "dept-product",   name: "产品部",   code: "PD",      parentId: undefined,      memberCount: 9,  sortOrder: 2, isActive: true },
  { id: "dept-design",    name: "设计组",   code: "DES",     parentId: "dept-product", memberCount: 4,  sortOrder: 1, isActive: true },
  { id: "dept-pm",        name: "产品组",   code: "PM",      parentId: "dept-product", memberCount: 5,  sortOrder: 2, isActive: true },
  { id: "dept-marketing", name: "市场部",   code: "MKT",     parentId: undefined,      memberCount: 7,  sortOrder: 3, isActive: true },
  { id: "dept-ops",       name: "运营部",   code: "OPS",     parentId: undefined,      memberCount: 5,  sortOrder: 4, isActive: true },
  { id: "dept-hr",        name: "人力资源部", code: "HR",    parentId: undefined,      memberCount: 4,  sortOrder: 5, isActive: true },
];

// ── 用户 mock 数据 ────────────────────────────────────

const statuses: MemberStatus[] = ["active", "active", "active", "active", "disabled", "resigned"];

const DEPT_USERS: Array<{ deptId: string; deptName: string; jobTitles: string[] }> = [
  { deptId: "dept-frontend",  deptName: "前端组",   jobTitles: ["前端工程师", "高级前端工程师", "前端负责人"] },
  { deptId: "dept-backend",   deptName: "后端组",   jobTitles: ["后端工程师", "高级后端工程师", "架构师"] },
  { deptId: "dept-qa",        deptName: "测试组",   jobTitles: ["测试工程师", "高级测试工程师"] },
  { deptId: "dept-design",    deptName: "设计组",   jobTitles: ["UI 设计师", "交互设计师"] },
  { deptId: "dept-pm",        deptName: "产品组",   jobTitles: ["产品经理", "高级产品经理"] },
  { deptId: "dept-marketing", deptName: "市场部",   jobTitles: ["市场专员", "市场经理"] },
  { deptId: "dept-ops",       deptName: "运营部",   jobTitles: ["运营专员", "运营经理"] },
  { deptId: "dept-hr",        deptName: "人力资源部", jobTitles: ["HR 专员", "HRBP"] },
];

const names = ["张伟","李娜","王芳","刘洋","陈静","赵磊","黄丽","周涛","吴霞","郑强",
  "孙敏","朱杰","胡娟","高峰","林燕","何勇","罗敏","梁军","郭丽","谢涛"];
const managers = ["张伟","李娜","赵磊","高峰","林燕"];

export function generateMembers(n: number): Member[] {
  return Array.from({ length: n }, (_, i) => {
    const status = statuses[i % statuses.length]!;
    const name = names[i % names.length]!;
    const deptInfo = DEPT_USERS[i % DEPT_USERS.length]!;
    const jobTitleList = deptInfo.jobTitles;
    const jobTitle = jobTitleList[i % jobTitleList.length]!;
    const hiredDate = new Date(2022, 0, 1);
    hiredDate.setDate(hiredDate.getDate() + i * 15);
    const suffix = i >= names.length ? String(Math.floor(i / names.length) + 1) : "";

    return {
      id: `member-${i + 1}`,
      loginName: `user${String(i + 1).padStart(3, "0")}`,
      name: `${name}${suffix}`,
      email: `${name.toLowerCase()}${i + 1}@example.com`,
      mobile: `138${String(10000000 + i).slice(1)}`,
      status,
      primaryDeptId: deptInfo.deptId,
      primaryDeptName: deptInfo.deptName,
      jobTitle,
      employeeNo: `EMP${String(1000 + i + 1)}`,
      gender: i % 3 === 0 ? "female" : "male",
      hiredAt: hiredDate.toISOString(),
      isAdmin: i === 0,
      managerName: i > 0 ? managers[i % managers.length] : undefined,
    };
  });
}

export const MOCK_MEMBERS = generateMembers(50);
// 旧别名
export const MOCK_USERS = MOCK_MEMBERS;
