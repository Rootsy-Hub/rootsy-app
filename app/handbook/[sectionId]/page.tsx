import { HandbookWorkspace } from "@/app/handbook/HandbookWorkspace"
import {
  DEFAULT_HANDBOOK_SECTION,
  handbookSectionHref,
  isValidHandbookSection,
} from "@/app/handbook/layoutHandbookShared"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

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
