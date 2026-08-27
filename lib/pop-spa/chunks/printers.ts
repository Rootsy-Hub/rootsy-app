export default () =>
  import("@/app/[siteId]/[popId]/printers/PrintersWorkspaceView").then((mod) => ({ default: mod.PrintersWorkspaceView }))
