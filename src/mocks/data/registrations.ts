import type { RegistrationRequest, AutoApprovalRule, ImportPreviewRow } from "@/types/user"

export const mockRegistrations: RegistrationRequest[] = [
  {
    id: "reg_001",
    name: "王小明",
    loginName: "wang.xiaoming",
    email: "wang.xiaoming@corp.ai",
    requestedDeptId: "dept_rd",
    requestedDeptName: "研发部",
    message: "参与新产品研发项目，需要 AI 助手支持日常编码工作",
    registeredAt: "2025-03-10T09:15:00Z",
    status: "pending",
  },
  {
    id: "reg_002",
    name: "李美丽",
    loginName: "li.meili",
    email: "li.meili@partner.com",
    requestedDeptId: "dept_mkt",
    requestedDeptName: "市场部",
    message: "与贵司合作项目需要协同使用",
    registeredAt: "2025-03-11T14:30:00Z",
    status: "pending",
  },
  {
    id: "reg_003",
    name: "张伟",
    loginName: "zhang.wei",
    email: "zhang.wei@corp.ai",
    requestedDeptId: "dept_pm",
    requestedDeptName: "产品部",
    registeredAt: "2025-03-12T10:00:00Z",
    status: "pending",
  },
  {
    id: "reg_004",
    name: "陈晓婷",
    loginName: "chen.xiaoting",
    email: "chen.xiaoting@external.net",
    message: "临时访问申请，仅需使用文档分析功能",
    registeredAt: "2025-03-13T16:45:00Z",
    status: "pending",
  },
  {
    id: "reg_005",
    name: "刘建国",
    loginName: "liu.jianguo",
    email: "liu.jianguo@corp.ai",
    requestedDeptId: "dept_rd",
    requestedDeptName: "研发部",
    registeredAt: "2025-03-13T18:00:00Z",
    status: "pending",
  },
]

export const mockAutoApprovalRules: AutoApprovalRule[] = [
  {
    id: "rule_001",
    type: "email_domain",
    value: "@corp.ai",
    description: "公司主域名，自动通过",
    isEnabled: true,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "rule_002",
    type: "email_domain",
    value: "@subsidiary.corp",
    description: "子公司域名",
    isEnabled: true,
    createdAt: "2024-06-01T00:00:00Z",
  },
  {
    id: "rule_003",
    type: "email_domain",
    value: "@partner.com",
    description: "战略合作伙伴",
    isEnabled: false,
    createdAt: "2025-01-15T00:00:00Z",
  },
]

export const mockImportPreview: ImportPreviewRow[] = [
  { rowNo: 2, name: "赵大强", loginName: "zhao.daqiang", email: "zhao.daqiang@corp.ai", mobile: "13812345601", deptName: "研发部", jobTitle: "高级工程师", employeeNo: "E1001", status: "ok" },
  { rowNo: 3, name: "孙芳芳", loginName: "sun.fangfang", email: "sun.fangfang@corp.ai", mobile: "13812345602", deptName: "产品部", jobTitle: "产品经理", employeeNo: "P2003", status: "ok" },
  { rowNo: 4, name: "周建华", loginName: "zhou.jianhua", email: "zhou.jianhua@corp.ai", mobile: "13812345603", deptName: "市场部", jobTitle: "市场专员", employeeNo: "M3012", status: "duplicate", errorMsg: "账号 zhou.jianhua 已存在" },
  { rowNo: 5, name: "吴丽娟", loginName: "wu.lijuan", email: "wu.lijuan@corp.ai", mobile: "13812345604", deptName: "财务部", jobTitle: "财务分析师", employeeNo: "F4021", status: "ok" },
  { rowNo: 6, name: "郑国庆", loginName: "zheng.guoqing", email: "", mobile: "13812345605", deptName: "未知部门", jobTitle: "运营", employeeNo: "O5007", status: "error", errorMsg: "部门「未知部门」不存在" },
  { rowNo: 7, name: "马晓东", loginName: "ma.xiaodong", email: "ma.xiaodong@corp.ai", mobile: "13812345606", deptName: "研发部", jobTitle: "前端工程师", employeeNo: "E1098", status: "ok" },
  { rowNo: 8, name: "秦淑华", loginName: "qin.shuhua", email: "qin.shuhua@corp.ai", mobile: "13812345607", deptName: "人力资源部", jobTitle: "HR 专员", employeeNo: "H6003", status: "ok" },
  { rowNo: 9, name: "韩云峰", loginName: "", email: "han.yunfeng@corp.ai", mobile: "13812345608", deptName: "研发部", jobTitle: "后端工程师", employeeNo: "E1102", status: "error", errorMsg: "账号不能为空" },
]
