import {
  getHandbookSectionMeta,
  type HandbookBlock,
  type HandbookSectionMeta,
  type HandbookTopic,
} from "@/app/handbook/handbookSections"
import {
  libraryDocBodyClass,
  libraryDocPageDescriptionClass,
  libraryDocPageTitleClass,
  libraryDocSectionTitleClass,
  handbookDocChapterClass,
} from "@/app/library/libraryColorTheme"
import { cn } from "@/lib/utils"

function HandbookTopicBlocks({ blocks }: { blocks: HandbookBlock[] }) {
  return (
    <div className="mt-4 space-y-4">
      {blocks.map((block, index) => {
        if (block.type === "p") {
          return (
            <p key={index} className={libraryDocBodyClass}>
              {block.text}
            </p>
          )
        }

        if (block.type === "h3") {
          return (
            <h3
              key={index}
              className={cn(libraryDocSectionTitleClass, index > 0 && "pt-2")}
            >
              {block.text}
            </h3>
          )
        }

        if (block.type === "ol") {
          return (
            <ol key={index} className={cn(libraryDocBodyClass, "list-decimal space-y-1.5 pl-5")}>
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          )
        }

        return (
          <ul key={index} className={cn(libraryDocBodyClass, "list-disc space-y-1.5 pl-5")}>
            {block.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )
      })}
    </div>
  )
}

function HandbookFormingNote() {
  return (
    <p className={cn(libraryDocPageDescriptionClass, "mt-3 max-w-md italic")}>
      Esta parte todavía se está formando.
    </p>
  )
}

function HandbookTopicSection({
  topic,
  level,
}: {
  topic: HandbookTopic
  level: 2 | 3
}) {
  const Heading = level === 2 ? "h2" : "h3"
  const nested = topic.topics ?? []
  const hasBlocks = Boolean(topic.blocks?.length)
  const hasNested = nested.length > 0

  return (
    <section
      id={topic.id}
      className={cn(
        "scroll-mt-24",
        level === 2 && cn(handbookDocChapterClass, "first:border-t-0 first:pt-0"),
        level === 3 && "mt-8",
      )}
    >
      <Heading
        className={cn(
          libraryDocSectionTitleClass,
          level === 2 ? "text-base" : "text-sm",
        )}
      >
        {topic.title}
      </Heading>
      {hasBlocks && topic.blocks ? (
        <HandbookTopicBlocks blocks={topic.blocks} />
      ) : null}
      {!hasBlocks && !hasNested ? <HandbookFormingNote /> : null}
      {nested.map((child) => (
        <HandbookTopicSection key={child.id} topic={child} level={3} />
      ))}
    </section>
  )
}

export function HandbookSectionView({
  sectionId,
  meta,
}: {
  sectionId?: string
  meta?: HandbookSectionMeta
}) {
  const resolved = meta ?? (sectionId ? getHandbookSectionMeta(sectionId) : undefined)
  if (!resolved) return null

  return (
    <article className="max-w-3xl">
      <h1 className={cn(libraryDocPageTitleClass, "text-2xl")}>{resolved.title}</h1>

      <div className="mt-10">
        {resolved.topics.map((topic) => (
          <HandbookTopicSection key={topic.id} topic={topic} level={2} />
        ))}
      </div>
    </article>
  )
}
