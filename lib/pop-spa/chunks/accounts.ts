export default () =>
  import("@/app/[siteId]/[popId]/accounts/AccountsWorkspaceView").then((mod) => ({ default: mod.AccountsWorkspaceView }))
