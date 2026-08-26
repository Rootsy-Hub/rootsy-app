import { HANDBOOK_SECTION_IDS } from "@/app/handbook/layoutHandbookShared"

export function generateStaticParams() {
  return HANDBOOK_SECTION_IDS.filter((sectionId) => sectionId !== "sistema-de-diseno").map(
    (sectionId) => ({ sectionId }),
  )
}

export default function HandbookSectionPage() {
  return null
}
