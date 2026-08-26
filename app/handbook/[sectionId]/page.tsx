import { HandbookWorkspace } from "@/app/handbook/HandbookWorkspace"
import {
  DEFAULT_HANDBOOK_SECTION,
  HANDBOOK_SECTION_IDS,
  handbookSectionHref,
  isValidHandbookSection,
} from "@/app/handbook/layoutHandbookShared"
import { redirect } from "next/navigation"

export function generateStaticParams() {
  return HANDBOOK_SECTION_IDS.map((sectionId) => ({ sectionId }))
}

export default async function HandbookSectionPage({
  params,
}: {
  params: Promise<{ sectionId: string }>
}) {
  const { sectionId } = await params

  if (!isValidHandbookSection(sectionId)) {
    redirect(handbookSectionHref(DEFAULT_HANDBOOK_SECTION))
  }

  return <HandbookWorkspace sectionId={sectionId} />
}
