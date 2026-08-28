export default () =>
  import("@/app/[siteId]/[popId]/invoices/InvoicesWorkspaceView").then((mod) => ({ default: mod.InvoicesWorkspaceView }))
