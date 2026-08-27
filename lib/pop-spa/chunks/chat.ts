export default () =>
  import("@/app/[siteId]/[popId]/chat/ChatWorkspaceView").then((mod) => ({ default: mod.ChatWorkspaceView }))
