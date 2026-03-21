import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { LoginPage } from "@/pages/LoginPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { UsersPage } from "@/pages/UsersPage";
import { ModelsPage } from "@/pages/ModelsPage";
import { AuditLogsPage } from "@/pages/AuditLogsPage";
import { VersionsPage } from "@/pages/VersionsPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import {
  TenantsPage,
  OrgPage,
  KnowledgeBasePage,
  SkillApprovalPage,
} from "@/pages/enterprise/ComingSoonPages";
import { DlpPage } from "@/pages/enterprise/DlpPage";
import { ExtensionsPage } from "@/pages/enterprise/ExtensionsPage";
import { LicensePage } from "@/pages/settings/LicensePage";
import { BrandPage } from "@/pages/settings/BrandPage";
import { RulesPage } from "@/pages/settings/RulesPage";
import { NavigationPage } from "@/pages/settings/NavigationPage";
import { PermissionsPage } from "@/pages/settings/PermissionsPage";
import { IdentitySyncPage } from "@/pages/settings/IdentitySyncPage";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: <AuthGuard />,
    children: [
      {
        path: "/",
        element: <AppShell />,
        children: [
          {
            index: true,
            element: <Navigate to="/dashboard" replace />,
          },
          {
            path: "dashboard",
            element: <DashboardPage />,
          },
          {
            path: "users",
            element: <UsersPage />,
          },
          {
            path: "models",
            element: <ModelsPage />,
          },
          {
            path: "audit-logs",
            element: <AuditLogsPage />,
          },
          {
            path: "versions",
            element: <VersionsPage />,
          },
          {
            path: "enterprise/tenants",
            element: <TenantsPage />,
          },
          {
            path: "enterprise/org",
            element: <OrgPage />,
          },
          {
            path: "enterprise/knowledge-base",
            element: <KnowledgeBasePage />,
          },
          {
            path: "enterprise/extensions",
            element: <ExtensionsPage />,
          },
          {
            path: "enterprise/dlp",
            element: <DlpPage />,
          },
          {
            path: "enterprise/skill-approval",
            element: <SkillApprovalPage />,
          },
          {
            path: "settings/license",
            element: <LicensePage />,
          },
          {
            path: "settings/brand",
            element: <BrandPage />,
          },
          {
            path: "settings/rules",
            element: <RulesPage />,
          },
          {
            path: "settings/navigation",
            element: <NavigationPage />,
          },
          {
            path: "settings/permissions",
            element: <PermissionsPage />,
          },
          {
            path: "settings/identity-sync",
            element: <IdentitySyncPage />,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
