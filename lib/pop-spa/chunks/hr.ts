export default () =>
  import("@/app/[siteId]/[popId]/hr/HrWorkspaceView").then((mod) => ({ default: mod.HrWorkspaceView }))
