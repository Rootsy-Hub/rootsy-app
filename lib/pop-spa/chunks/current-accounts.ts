export default () =>
  import("@/app/[siteId]/[popId]/current-accounts/CurrentAccountsWorkspaceView").then((mod) => ({ default: mod.CurrentAccountsWorkspaceView }))
