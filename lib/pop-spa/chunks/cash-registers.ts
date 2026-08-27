export default () =>
  import("@/app/[siteId]/[popId]/cash-registers/CashRegistersWorkspaceView").then((mod) => ({ default: mod.CashRegistersWorkspaceView }))
