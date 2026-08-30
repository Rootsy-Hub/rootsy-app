import { HANDBOOK_V2_PAGE_IDS, getHandbookV2Page } from "@/app/handbook/handbookV2"
import type { Metadata } from "next"

export function generateStaticParams() {
  return HANDBOOK_V2_PAGE_IDS.filter((pageId) => pageId !== "overview").map((pageId) => ({
    pageId,
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pageId: string }>
}): Promise<Metadata> {
  const { pageId } = await params
  const page = getHandbookV2Page(pageId)
  return {
    title: page
      ? `${page.label} · Sistema de diseño v2 · Rootsy`
      : "Sistema de diseño v2 · Handbook · Rootsy",
  }
}

export default function HandbookV2Page() {
  return null
}
