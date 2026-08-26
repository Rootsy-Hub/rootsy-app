import { HANDBOOK_DESIGN_SYSTEM_PAGE_IDS } from "@/app/handbook/handbookDesignSystem"

export function generateStaticParams() {
  return HANDBOOK_DESIGN_SYSTEM_PAGE_IDS.filter((pageId) => pageId !== "overview").map(
    (pageId) => ({ pageId }),
  )
}

export default function HandbookDesignSystemPage() {
  return null
}
