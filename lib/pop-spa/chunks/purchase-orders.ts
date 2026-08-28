export default () =>
  import("@/components/purchase-orders/PurchaseOrdersWorkspaceView").then((mod) => ({ default: mod.PurchaseOrdersWorkspaceView }))
