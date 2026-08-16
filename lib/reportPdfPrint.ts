"use client"

import type { jsPDF } from "jspdf"

const PRINT_RESOURCE_CLEANUP_FALLBACK_MS = 120_000

function schedulePrintResourceCleanup(
  printTarget: Window,
  cleanup: () => void,
): void {
  let settled = false

  const done = () => {
    if (settled) return
    settled = true

    window.removeEventListener("afterprint", done)
    printTarget.removeEventListener("afterprint", done)
    window.removeEventListener("focus", onWindowFocus)
    cleanup()
  }

  let dialogOpened = false

  const onWindowFocus = () => {
    if (!dialogOpened) return
    window.setTimeout(done, 300)
  }

  window.addEventListener("afterprint", done, { once: true })
  printTarget.addEventListener("afterprint", done, { once: true })
  window.addEventListener("focus", onWindowFocus)
  window.addEventListener(
    "blur",
    () => {
      dialogOpened = true
    },
    { once: true },
  )

  window.setTimeout(() => {
    dialogOpened = true
  }, 300)

  window.setTimeout(done, PRINT_RESOURCE_CLEANUP_FALLBACK_MS)
}

export async function printJsPdfDocument(doc: jsPDF): Promise<void> {
  const blob = doc.output("blob")
  const url = URL.createObjectURL(blob)

  await new Promise<void>((resolve, reject) => {
    const iframe = document.createElement("iframe")
    iframe.setAttribute("aria-hidden", "true")
    iframe.style.position = "fixed"
    iframe.style.right = "0"
    iframe.style.bottom = "0"
    iframe.style.width = "0"
    iframe.style.height = "0"
    iframe.style.border = "none"
    document.body.appendChild(iframe)

    const cleanup = () => {
      URL.revokeObjectURL(url)
      iframe.remove()
    }

    iframe.onload = () => {
      try {
        const printWindow = iframe.contentWindow
        if (!printWindow) {
          cleanup()
          reject(new Error("No se pudo abrir el diálogo de impresión."))
          return
        }

        printWindow.focus()
        printWindow.print()

        schedulePrintResourceCleanup(printWindow, cleanup)
        resolve()
      } catch (error: unknown) {
        cleanup()
        reject(
          error instanceof Error
            ? error
            : new Error("No se pudo abrir el diálogo de impresión."),
        )
      }
    }

    iframe.onerror = () => {
      cleanup()
      reject(new Error("No se pudo preparar el documento para imprimir."))
    }

    iframe.src = url
  })
}
