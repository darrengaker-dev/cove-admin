import { userHandlers } from "./users";
import { modelHandlers } from "./models";
import { auditLogHandlers } from "./audit-logs";
import { versionHandlers } from "./versions";
import { metricHandlers } from "./metrics";
import { dlpHandlers } from "./dlp";
import { enterpriseSettingsHandlers } from "./enterprise-settings";
import { permissionHandlers } from "./permissions";
import { extensionHandlers } from "./extensions";
import { registrationHandlers } from "./registrations";
import { identitySyncHandlers } from "./identity-sync";

export const handlers = [
  ...userHandlers,
  ...modelHandlers,
  ...auditLogHandlers,
  ...versionHandlers,
  ...metricHandlers,
  ...dlpHandlers,
  ...enterpriseSettingsHandlers,
  ...permissionHandlers,
  ...extensionHandlers,
  ...registrationHandlers,
  ...identitySyncHandlers,
];
