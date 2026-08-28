export default () =>
  import("@/app/[siteId]/[popId]/reports/ReportsWorkspaceView").then((mod) => ({ default: mod.ReportsWorkspaceView }))
