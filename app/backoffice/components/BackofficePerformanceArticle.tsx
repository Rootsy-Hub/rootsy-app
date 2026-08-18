import {
  libraryDocBodyClass,
  libraryDocMetaLabelClass,
  libraryDocSectionTitleClass,
} from "@/app/library/libraryColorTheme"
import {
  statisticsSectionPageSubtitleClass,
  statisticsSectionPageTitleClass,
} from "@/components/statistics/statisticsWorkspaceStyles"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

export type BackofficePerformanceCostSample = {
  label: string
  current: number
  target: number
}

type BackofficePerformanceArticleProps = {
  title: string
  subtitle: string
  topic: string
  strategy: string
  measure: string
  ok: boolean
  verdict: string
  chartCaption: string
  chartHint: string
  samples: readonly BackofficePerformanceCostSample[]
  diagram: ReactNode
  children?: ReactNode
}

export function BackofficePerformanceArticle({
  title,
  subtitle,
  topic,
  strategy,
  measure,
  ok,
  verdict,
  chartCaption,
  chartHint,
  samples,
  diagram,
  children,
}: BackofficePerformanceArticleProps) {
  const max = Math.max(
    1,
    ...samples.flatMap((sample) => [sample.current, sample.target]),
  )

  return (
    <article className="mx-auto max-w-2xl space-y-12 pb-16 pt-2">
      <header className="space-y-3">
        <p className={libraryDocMetaLabelClass}>Performance</p>
        <h1 className={statisticsSectionPageTitleClass}>{title}</h1>
        <p className={cn(statisticsSectionPageSubtitleClass, "max-w-xl")}>
          {subtitle}
        </p>
      </header>

      <p className={cn(libraryDocBodyClass, "max-w-none")}>{topic}</p>

      <section className="space-y-5 border-t border-rootsy-bruma-200 pt-10">
        <h2 className={libraryDocSectionTitleClass}>Cómo funciona</h2>
        {diagram}
      </section>

      <section className="space-y-4 border-t border-rootsy-bruma-200 pt-10">
        <h2 className={libraryDocSectionTitleClass}>Estrategia de hoy</h2>
        <p className={cn(libraryDocBodyClass, "max-w-none")}>{strategy}</p>
      </section>

      <section className="space-y-6 border-t border-rootsy-bruma-200 pt-10">
        <div className="space-y-4">
          <h2 className={libraryDocSectionTitleClass}>
            Cómo sabemos si estamos bien
          </h2>
          <p className={cn(libraryDocBodyClass, "max-w-none")}>{measure}</p>
        </div>

        <p
          className={cn(
            "font-canopy text-sm font-semibold",
            ok ? "text-rootsy-savia-700" : "text-rootsy-bruma-900",
          )}
        >
          {ok ? "Estamos bien." : "No estamos bien."} {verdict}
        </p>

        <figure className="space-y-5">
          <figcaption className={libraryDocMetaLabelClass}>
            {chartCaption}
          </figcaption>
          <ul className="space-y-3" aria-label={chartCaption}>
            {samples.map((sample) => {
              const rowOk = sample.current <= sample.target

              return (
                <li
                  key={sample.label}
                  className="grid grid-cols-[5.5rem_1fr_2rem] items-center gap-3"
                >
                  <span className="font-canopy text-xs text-rootsy-bruma-500">
                    {sample.label}
                  </span>
                  <div
                    className="relative h-2 rounded-full bg-rootsy-bruma-100"
                    aria-hidden
                  >
                    <span
                      className={cn(
                        "absolute inset-y-0 left-0 rounded-full",
                        rowOk ? "bg-rootsy-savia-600" : "bg-rootsy-bruma-400",
                      )}
                      style={{ width: `${(sample.current / max) * 100}%` }}
                    />
                    <span
                      className="absolute top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-rootsy-savia-600"
                      style={{
                        left: `${(sample.target / max) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="font-numeric text-right text-sm font-semibold tabular-nums text-rootsy-bruma-900">
                    {sample.current}
                  </span>
                </li>
              )
            })}
          </ul>
          <p className="font-canopy text-xs leading-relaxed text-rootsy-bruma-500">
            {chartHint}
          </p>
        </figure>

        {children ? (
          <div className={cn(libraryDocBodyClass, "max-w-none")}>{children}</div>
        ) : null}
      </section>
    </article>
  )
}
