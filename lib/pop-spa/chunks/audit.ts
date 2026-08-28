export default () =>
  import("@/app/[siteId]/[popId]/audit/AuditWorkspaceView").then((mod) => ({ default: mod.AuditWorkspaceView }))
