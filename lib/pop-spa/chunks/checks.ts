export default () =>
  import("@/app/[siteId]/[popId]/checks/ChecksWorkspaceView").then((mod) => ({ default: mod.ChecksWorkspaceView }))
