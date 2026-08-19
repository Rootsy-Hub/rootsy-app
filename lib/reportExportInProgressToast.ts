import { showRootsyToast } from "@/components/rootsy-toast"

type ExportInProgressToastOptions = {
  title?: string
  description?: string
}

export function showReportExportInProgressToast(
  options: ExportInProgressToastOptions = {},
): () => void {
  const { dismiss } = showRootsyToast({
    title: options.title ?? "Generando reporte…",
    description:
      options.description ??
      "Puede tardar unos momentos. No cierres esta página hasta que termine.",
    intent: "info",
    duration: Number.POSITIVE_INFINITY,
  })

  return () => {
    requestAnimationFrame(() => {
      dismiss()
    })
  }
}
