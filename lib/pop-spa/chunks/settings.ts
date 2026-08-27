export default () =>
  import("@/app/[siteId]/[popId]/settings/SettingsWorkspaceView").then((mod) => ({ default: mod.SettingsWorkspaceView }))
