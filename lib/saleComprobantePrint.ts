"use client"

export type SaleComprobantePrintFormat = "rollo" | "hoja"

export const SALE_COMPROBANTE_PRINT_FORMATS = [
  { value: "rollo" as const, label: "80 mm" },
  { value: "hoja" as const, label: "A4" },
]

export const saleComprobantePrintSurfaceClass =
  "sale-comprobante-print-surface"

const PRINT_CLEANUP_FALLBACK_MS = 120_000

function copyDocumentStyles(source: Document, target: Document) {
  target.documentElement.className = source.documentElement.className
  target.documentElement.lang = source.documentElement.lang || "es"
  for (const node of source.querySelectorAll("link[rel='stylesheet'], style")) {
    target.head.appendChild(node.cloneNode(true))
  }
}

function printPageCss(format: SaleComprobantePrintFormat): string {
  const page =
    format === "hoja"
      ? "@page { size: A4 portrait; margin: 12mm; }"
      : "@page { size: 80mm auto; margin: 3mm; }"

  return `
    ${page}
    html, body {
      margin: 0;
      background: #fff !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .sale-comprobante-print-surface {
      box-shadow: none !important;
      outline: none !important;
    }
    .sale-comprobante-print-tear {
      display: none !important;
    }
    ${
      format === "rollo"
        ? `
    .sale-comprobante-print-surface {
      width: 74mm !important;
      max-width: 74mm !important;
      margin: 0 auto !important;
    }`
        : `
    .sale-comprobante-print-surface {
      width: 100% !important;
      max-width: none !important;
      margin: 0 !important;
    }`
    }
  `
}

function schedulePrintCleanup(printTarget: Window, cleanup: () => void) {
  let settled = false
  const done = () => {
    if (settled) return
    settled = true
    window.removeEventListener("afterprint", done)
    printTarget.removeEventListener("afterprint", done)
    cleanup()
  }

  window.addEventListener("afterprint", done, { once: true })
  printTarget.addEventListener("afterprint", done, { once: true })
  window.setTimeout(done, PRINT_CLEANUP_FALLBACK_MS)
}

export async function printSaleComprobanteElement(
  element: HTMLElement,
  format: SaleComprobantePrintFormat,
): Promise<void> {
  const iframe = document.createElement("iframe")
  iframe.setAttribute("aria-hidden", "true")
  iframe.style.position = "fixed"
  iframe.style.right = "0"
  iframe.style.bottom = "0"
  iframe.style.width = "0"
  iframe.style.height = "0"
  iframe.style.border = "none"
  document.body.appendChild(iframe)

  const printWindow = iframe.contentWindow
  const printDocument = iframe.contentDocument
  if (!printWindow || !printDocument) {
    iframe.remove()
    throw new Error("No se pudo abrir el diálogo de impresión.")
  }

  printDocument.open()
  printDocument.write("<!DOCTYPE html><html><head></head><body></body></html>")
  printDocument.close()

  copyDocumentStyles(document, printDocument)

  const printStyle = printDocument.createElement("style")
  printStyle.textContent = printPageCss(format)
  printDocument.head.appendChild(printStyle)

  printDocument.body.appendChild(element.cloneNode(true))

  await new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => resolve())
    })
  })

  printWindow.focus()
  printWindow.print()
  schedulePrintCleanup(printWindow, () => iframe.remove())
}
