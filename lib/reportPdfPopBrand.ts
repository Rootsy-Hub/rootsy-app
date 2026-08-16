"use client"

import { formatPopDisplayAddress } from "@/lib/popIdentityDisplay"
import { loadSvg2PdfPlugin } from "@/lib/reportPdfRuntime"
import type { jsPDF } from "jspdf"

/** Avatar mediano — ficha horizontal · dirección (`/library/logos`). */
const POP_LOGO_SIZE_MM = 12
const HEADER_MARGIN_MM = 14
const HEADER_TOP_MM = 14
const LOGO_TEXT_GAP_MM = 3
const MAX_TEXT_WIDTH_MM = 56

type JsPdfWithSvg = jsPDF & {
  svg: (
    element: Element,
    options?: { x?: number; y?: number; width?: number; height?: number },
  ) => Promise<jsPDF>
  getTextWidth: (text: string) => number
  splitTextToSize: (text: string, maxWidth: number) => string[]
}

export type ReportPdfPopBrandOptions = {
  popName?: string
  popLogoUrl?: string
  popStreetAddress?: string | null
  popCity?: string | null
  align?: "left" | "right"
}

function resolvePdfImageFormat(
  mimeType: string,
): "PNG" | "JPEG" | "WEBP" | null {
  if (mimeType.includes("png")) return "PNG"
  if (mimeType.includes("jpeg") || mimeType.includes("jpg")) return "JPEG"
  if (mimeType.includes("webp")) return "WEBP"
  return null
}

async function loadRasterImageElement(url: string): Promise<{
  img: HTMLImageElement
  format: "PNG" | "JPEG" | "WEBP"
} | null> {
  try {
    const response = await fetch(url)
    if (!response.ok) return null

    const blob = await response.blob()
    const format = resolvePdfImageFormat(blob.type)
    if (!format) return null

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result ?? ""))
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(blob)
    })

    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image()
      el.onload = () => resolve(el)
      el.onerror = () => reject(new Error("No se pudo decodificar la imagen."))
      el.src = dataUrl
    })

    if (img.naturalWidth <= 0 || img.naturalHeight <= 0) return null

    return { img, format }
  } catch {
    return null
  }
}

/** Recorte cuadrado superior-centro (object-cover) para avatares POP. */
function cropPopLogoToSquarePng(img: HTMLImageElement): string | null {
  const { naturalWidth: w, naturalHeight: h } = img
  if (w <= 0 || h <= 0) return null

  let sx: number
  let sy: number
  let sSize: number

  if (w >= h) {
    sSize = h
    sx = (w - h) / 2
    sy = 0
  } else {
    sSize = w
    sx = 0
    sy = 0
  }

  const canvas = document.createElement("canvas")
  canvas.width = sSize
  canvas.height = sSize
  const ctx = canvas.getContext("2d")
  if (!ctx) return null

  ctx.drawImage(img, sx, sy, sSize, sSize, 0, 0, sSize, sSize)
  return canvas.toDataURL("image/png")
}

async function drawSvgLogoForPdf(
  doc: JsPdfWithSvg,
  url: string,
  box: { x: number; y: number; width: number; height: number },
): Promise<boolean> {
  try {
    const response = await fetch(url)
    if (!response.ok) return false
    const markup = await response.text()
    const parsed = new DOMParser().parseFromString(markup, "image/svg+xml")
    const svg = parsed.documentElement
    if (!(svg instanceof SVGSVGElement)) return false
    await doc.svg(svg, box)
    return true
  } catch {
    return false
  }
}

/** Ficha horizontal POP. Devuelve la Y final del bloque. */
export async function drawReportPdfPopBrandHeader(
  doc: jsPDF,
  options: ReportPdfPopBrandOptions,
): Promise<number> {
  await loadSvg2PdfPlugin()
  const pdf = doc as JsPdfWithSvg
  const align = options.align ?? "right"
  const pageWidth = pdf.internal.pageSize.getWidth()
  const popName = options.popName?.trim()
  const address = formatPopDisplayAddress(
    options.popStreetAddress,
    options.popCity,
  )

  if (!popName && !address && !options.popLogoUrl?.trim()) {
    return HEADER_TOP_MM
  }

  const startY = HEADER_TOP_MM
  let logoDrawn = false

  const logoUrl = options.popLogoUrl?.trim()
  let textBlockHeight = 0
  let nameLines: string[] = []
  let addressLines: string[] = []

  if (popName) {
    pdf.setTextColor(0, 0, 0)
    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(10)
    nameLines = pdf.splitTextToSize(popName, MAX_TEXT_WIDTH_MM)
    textBlockHeight += nameLines.length * 4.2
  }

  if (address) {
    pdf.setFont("helvetica", "normal")
    pdf.setFontSize(8)
    addressLines = pdf.splitTextToSize(address, MAX_TEXT_WIDTH_MM)
    textBlockHeight += addressLines.length * 3.6 + (popName ? 0.8 : 0)
  }

  const textWidth = Math.min(
    MAX_TEXT_WIDTH_MM,
    Math.max(
      ...nameLines.map((line) => pdf.getTextWidth(line)),
      ...addressLines.map((line) => pdf.getTextWidth(line)),
      0,
    ),
  )
  const blockWidth =
    (logoDrawn || logoUrl ? POP_LOGO_SIZE_MM + LOGO_TEXT_GAP_MM : 0) +
    textWidth
  const blockRight =
    align === "right" ? pageWidth - HEADER_MARGIN_MM : HEADER_MARGIN_MM + blockWidth
  const blockLeft =
    align === "right" ? blockRight - blockWidth : HEADER_MARGIN_MM
  const logoX = blockLeft
  const textX = logoDrawn || logoUrl ? blockLeft + POP_LOGO_SIZE_MM + LOGO_TEXT_GAP_MM : blockLeft

  if (logoUrl) {
    const loaded = await loadRasterImageElement(logoUrl)
    if (loaded) {
      const squareDataUrl = cropPopLogoToSquarePng(loaded.img)
      if (squareDataUrl) {
        pdf.addImage(
          squareDataUrl,
          "PNG",
          logoX,
          startY,
          POP_LOGO_SIZE_MM,
          POP_LOGO_SIZE_MM,
        )
        logoDrawn = true
      }
    } else {
      logoDrawn = await drawSvgLogoForPdf(pdf, logoUrl, {
        x: logoX,
        y: startY,
        width: POP_LOGO_SIZE_MM,
        height: POP_LOGO_SIZE_MM,
      })
    }
  }

  const blockHeight = Math.max(
    logoDrawn ? POP_LOGO_SIZE_MM : 0,
    textBlockHeight || 0,
  )

  const textStartY =
    startY + Math.max(0, (blockHeight - textBlockHeight) / 2) + 3.5

  if (popName) {
    pdf.setTextColor(0, 0, 0)
    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(10)
    pdf.text(nameLines, textX, textStartY)
  }

  if (address) {
    pdf.setTextColor(100, 100, 100)
    pdf.setFont("helvetica", "normal")
    pdf.setFontSize(8)
    const addressY =
      textStartY + (popName ? nameLines.length * 4.2 + 0.6 : 0)
    pdf.text(addressLines, textX, addressY)
  }

  if (!logoDrawn && !popName && !address) {
    return HEADER_TOP_MM
  }

  return startY + blockHeight + 4
}
