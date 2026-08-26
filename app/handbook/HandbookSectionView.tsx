import { getHandbookSectionMeta } from "@/app/handbook/handbookSections"
import {
  libraryDocPageTitleClass,
  libraryDocSectionTitleClass,
} from "@/app/library/libraryColorTheme"
import { cn } from "@/lib/utils"

export function HandbookSectionView({ sectionId }: { sectionId: string }) {
  const meta = getHandbookSectionMeta(sectionId)
  if (!meta) return null

  return (
    <article className="max-w-3xl">
      <h1 className={cn(libraryDocPageTitleClass, "text-2xl")}>{meta.title}</h1>

      <div className="mt-10 space-y-0">
        {meta.topics.map((topic) => (
          <section
            key={topic.id}
            id={topic.id}
            className="scroll-mt-24 border-t border-rootsy-bruma-200 py-10 first:border-t-0 first:pt-0"
          >
            <h2 className={cn(libraryDocSectionTitleClass, "text-base")}>{topic.title}</h2>
            <div className="min-h-24" aria-hidden />
          </section>
        ))}
      </div>
    </article>
  )
}
