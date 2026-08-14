"use client"

import type { jsPDF } from "jspdf"
import "svg2pdf.js"
import {
  finalizeReportCsv,
  type ReportExportContext,
} from "@/lib/reportExportContext"

export const ROOTSY_REPORT_BRANDING_LABEL = "Generado por Rootsy"

export type { ReportExportContext, ReportExportPopInfo } from "@/lib/reportExportContext"
export {
  buildReportCsvMetadataSection,
  drawReportPdfIssuerBlock,
  formatReportExportCuit,
} from "@/lib/reportExportContext"

const ROOTSY_REPORT_LOGO_SRC = "/logos/rootsy/rootsy-logo-brand.svg"
const ROOTSY_REPORT_LOGO_ASPECT = 90 / 29
const ROOTSY_REPORT_LOGO_HEIGHT_MM = 6.5

type JsPdfWithSvg = jsPDF & {
  svg: (
    element: Element,
    options?: { x?: number; y?: number; width?: number; height?: number },
  ) => Promise<jsPDF>
}

let cachedLogoSvgMarkup: string | null = null

async function loadReportExportLogoSvgMarkup(): Promise<string | null> {
  if (cachedLogoSvgMarkup) return cachedLogoSvgMarkup

  try {
    const response = await fetch(ROOTSY_REPORT_LOGO_SRC)
    if (!response.ok) return null
    cachedLogoSvgMarkup = await response.text()
    return cachedLogoSvgMarkup
  } catch {
    return null
  }
}

function createReportExportLogoSvgElement(markup: string): SVGSVGElement | null {
  const parsed = new DOMParser().parseFromString(markup, "image/svg+xml")
  const svg = parsed.documentElement
  if (!(svg instanceof SVGSVGElement)) return null
  svg.setAttribute("width", "90")
  svg.setAttribute("height", "29")
  return svg
}

export function formatReportExportGeneratedAt(timeZone?: string): string {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
    ...(timeZone ? { timeZone } : {}),
  }).format(new Date())
}

export function appendReportCsvBranding(
  csv: string,
  context: ReportExportContext,
  options: { periodLabel: string; generatedAt?: string },
): string {
  const generatedAt = options.generatedAt ?? formatReportExportGeneratedAt()
  return finalizeReportCsv(csv, context, {
    periodLabel: options.periodLabel,
    generatedAt,
    brandingLabel: ROOTSY_REPORT_BRANDING_LABEL,
  })
}

function getReportPdfLogoDimensions() {
  const logoHeight = ROOTSY_REPORT_LOGO_HEIGHT_MM
  const logoWidth = logoHeight * ROOTSY_REPORT_LOGO_ASPECT
  return { logoHeight, logoWidth }
}

async function drawReportPdfBrandingFooterPage(
  doc: JsPdfWithSvg,
  pageNumber: number,
  options: {
    logoMarkup: string | null
  },
): Promise<void> {
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const footerBaselineY = pageHeight - 8
  const { logoHeight, logoWidth } = getReportPdfLogoDimensions()
  const logoY = footerBaselineY - logoHeight + 1.2

  if (options.logoMarkup) {
    const logoElement = createReportExportLogoSvgElement(options.logoMarkup)
    if (logoElement) {
      try {
        await doc.svg(logoElement, {
          x: 14,
          y: logoY,
          width: logoWidth,
          height: logoHeight,
        })
      } catch {
        // Sin logo si falla el render vectorial.
      }
    }
  }

  doc.setFont("helvetica", "normal")
  doc.setFontSize(7)
  doc.setTextColor(120, 120, 120)
  doc.text(
    `Página ${pageNumber} de ${doc.getNumberOfPages()}`,
    pageWidth - 14,
    footerBaselineY,
    { align: "right" },
  )

  doc.setTextColor(0, 0, 0)
}

export async function applyReportPdfBrandingFooters(doc: jsPDF): Promise<void> {
  const pdf = doc as JsPdfWithSvg
  const logoMarkup = await loadReportExportLogoSvgMarkup()
  const pageCount = pdf.getNumberOfPages()

  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
    pdf.setPage(pageNumber)
    await drawReportPdfBrandingFooterPage(pdf, pageNumber, {
      logoMarkup,
    })
  }
}
