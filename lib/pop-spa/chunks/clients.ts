export default () =>
  import("@/app/[siteId]/[popId]/clients/ClientsWorkspaceView").then((mod) => ({ default: mod.ClientsWorkspaceView }))
