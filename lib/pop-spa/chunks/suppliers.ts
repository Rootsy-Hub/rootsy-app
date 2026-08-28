export default () =>
  import("@/app/[siteId]/[popId]/suppliers/SuppliersWorkspaceView").then((mod) => ({ default: mod.SuppliersWorkspaceView }))
