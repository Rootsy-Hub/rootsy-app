"use client"

import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

export const articleFormSectionTitleClass =
  "text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500"

export function ArticleFormSection({
  title,
  description,
  children,
  className,
}: {
  title: string
  description?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn("space-y-3", className)}>
      <div>
        <h3 className={articleFormSectionTitleClass}>{title}</h3>
        {description ? (
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

export function ArticleFormPanel({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/60 bg-muted/15 p-3.5",
        className,
      )}
    >
      {children}
    </div>
  )
}
