export default () =>
  import("@/app/[siteId]/[popId]/promotions/PromotionsWorkspaceView").then((mod) => ({ default: mod.PromotionsWorkspaceView }))
