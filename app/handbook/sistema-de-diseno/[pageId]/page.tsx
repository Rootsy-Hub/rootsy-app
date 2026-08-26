import { HANDBOOK_DESIGN_SYSTEM_PAGE_IDS } from "@/app/handbook/handbookDesignSystem"

/** pageId cubre las páginas de foundations, componentes y componentes-final. */
export function generateStaticParams() {
  return HANDBOOK_DESIGN_SYSTEM_PAGE_IDS.filter((pageId) => pageId !== "overview").map(
    (pageId) => ({ pageId }),
  )
}

export default function HandbookDesignSystemPage() {
  return null
}
