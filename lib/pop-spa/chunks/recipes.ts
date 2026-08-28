export default () =>
  import("@/app/[siteId]/[popId]/recipes/RecipesWorkspaceView").then((mod) => ({ default: mod.RecipesWorkspaceView }))
