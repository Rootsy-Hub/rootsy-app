import { toast } from "@/hooks/use-toast"

type ExportInProgressToastOptions = {
  title?: string
  description?: string
}

export function showReportExportInProgressToast(
  options: ExportInProgressToastOptions = {},
): () => void {
  const { dismiss } = toast({
    title: options.title ?? "Generando reporte…",
    description:
      options.description ??
      "Puede tardar unos momentos. No cierres esta página hasta que termine.",
    duration: Number.POSITIVE_INFINITY,
  })

  return () => {
    requestAnimationFrame(() => {
      dismiss()
    })
  }
}
