export interface Tenant {
  id: string;
  name: string;
  plan: "starter" | "enterprise";
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
  parentId: string | null;
  memberCount: number;
}

export interface Member {
  id: string;
  tenantId: string;
  email: string;
  displayName: string;
  departmentId: string;
}

export interface KnowledgeBase {
  id: string;
  name: string;
  level: "personal" | "department" | "company";
  documentCount: number;
  createdAt: string;
}
