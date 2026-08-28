export default () =>
  import("@/app/[siteId]/[popId]/sale/SaleWorkspaceView").then((mod) => ({ default: mod.SaleWorkspaceView }))
