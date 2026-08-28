export default () =>
  import("@/app/[siteId]/[popId]/expenses/ExpensesWorkspaceView").then((mod) => ({ default: mod.ExpensesWorkspaceView }))
