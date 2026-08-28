export default () =>
  import("@/components/quotes/QuotesWorkspaceView").then((mod) => ({ default: mod.QuotesWorkspaceView }))
