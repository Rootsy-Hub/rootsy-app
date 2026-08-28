export default () =>
  import("@/app/[siteId]/[popId]/articles/ArticlesWorkspaceView").then((mod) => ({ default: mod.ArticlesWorkspaceView }))
