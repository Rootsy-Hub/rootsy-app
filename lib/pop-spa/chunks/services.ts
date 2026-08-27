export default () =>
  import("@/app/[siteId]/[popId]/services/ServicesWorkspaceView").then((mod) => ({ default: mod.ServicesWorkspaceView }))
