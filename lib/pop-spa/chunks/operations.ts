export default () =>
  import("@/app/[siteId]/[popId]/operations/OperationsWorkspaceView").then((mod) => ({ default: mod.OperationsWorkspaceView }))
