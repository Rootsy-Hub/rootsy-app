export default () =>
  import("@/app/[siteId]/[popId]/manufacturing/ManufacturingWorkspaceView").then((mod) => ({ default: mod.ManufacturingWorkspaceView }))
