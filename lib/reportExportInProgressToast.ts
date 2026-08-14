import { toast } from "@/hooks/use-toast"

export function showReportExportInProgressToast(): () => void {
  const { dismiss } = toast({
    title: "Generando reporte…",
    description:
      "Puede tardar unos momentos. No cierres esta página hasta que termine.",
    duration: Number.POSITIVE_INFINITY,
  })

  return dismiss
}
