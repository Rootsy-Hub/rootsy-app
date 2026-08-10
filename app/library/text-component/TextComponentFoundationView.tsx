"use client"

import {
  TextComponentBodySection,
  TextComponentCodeSection,
  TextComponentHeadingsSection,
  TextComponentLabelsSection,
  TextComponentMetaSection,
  TextComponentMetricSection,
  TextComponentOverviewSection,
  TextComponentReadingSection,
} from "@/app/library/text-component/TextComponentSections"
import { getTextComponentPageMeta } from "@/app/library/text-component/textComponentLibraryNav"
import type { ReactNode } from "react"

type Props = {
  sectionId: string
}

export function TextComponentFoundationView({ sectionId }: Props) {
  let content: ReactNode = null

  switch (sectionId) {
    case "component-text":
      content = <TextComponentOverviewSection />
      break
    case "component-text-headings":
      content = <TextComponentHeadingsSection />
      break
    case "component-text-body":
      content = <TextComponentBodySection />
      break
    case "component-text-labels":
      content = <TextComponentLabelsSection />
      break
    case "component-text-meta":
      content = <TextComponentMetaSection />
      break
    case "component-text-metric":
      content = <TextComponentMetricSection />
      break
    case "component-text-reading":
      content = <TextComponentReadingSection />
      break
    case "component-text-code":
      content = <TextComponentCodeSection />
      break
    default:
      return null
  }

  return <div className="space-y-10">{content}</div>
}

export function getTextComponentFoundationHeading(sectionId: string) {
  return getTextComponentPageMeta(sectionId)?.title ?? "Texto"
}
