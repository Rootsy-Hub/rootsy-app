"use client"

type JsPdfConstructor = typeof import("jspdf").jsPDF
type AutoTableFn = typeof import("jspdf-autotable").default

let cachedRuntime: {
  jsPDF: JsPdfConstructor
  autoTable: AutoTableFn
} | null = null

/** Carga jspdf en build browser — evita jspdf.node (fflate/worker) en SSR de Turbopack. */
export async function loadReportPdfRuntime(): Promise<{
  jsPDF: JsPdfConstructor
  autoTable: AutoTableFn
}> {
  if (cachedRuntime) {
    await loadSvg2PdfPlugin()
    return cachedRuntime
  }

  const jspdfModule = await import("jspdf")
  if (typeof window !== "undefined") {
    await import("svg2pdf.js")
  }
  const autoTableModule = await import("jspdf-autotable")

  const jsPDF =
    (jspdfModule as { jsPDF?: JsPdfConstructor; default?: JsPdfConstructor })
      .jsPDF ??
    (jspdfModule as { default?: JsPdfConstructor }).default

  if (!jsPDF) {
    throw new Error("No se pudo cargar jsPDF.")
  }

  cachedRuntime = {
    jsPDF,
    autoTable: autoTableModule.default,
  }
  return cachedRuntime
}

export async function loadSvg2PdfPlugin(): Promise<void> {
  if (typeof window === "undefined") return
  await import("svg2pdf.js")
}
