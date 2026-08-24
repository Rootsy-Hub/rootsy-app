"use client"

import "@/app/library/mundos/mundosHerramientas.css"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

const SPARK_A = ["28%", "72%", "46%", "96%", "64%"] as const
const SPARK_B = ["40%", "22%", "68%", "54%", "88%"] as const

export type MundosHerramientasSurface = "glass" | "flat"

type MundosHerramientasCrystalProps = {
  className?: string
  children: ReactNode
  surface?: MundosHerramientasSurface
}

/** Cáscara del mundo Herramientas — glass (frost) o flat (frost más marcado). */
export function MundosHerramientasCrystal({
  className,
  children,
  surface = "glass",
}: MundosHerramientasCrystalProps) {
  return (
    <div
      className={cn(
        "mundos-herramientas-card",
        surface === "flat" && "mundos-herramientas-card--flat",
        className,
      )}
      data-surface={surface}
    >
      <div className="mundos-herramientas-card__frost" aria-hidden />
      <div
        className="mundos-herramientas-card__rim mundos-herramientas-card__rim--glow"
        aria-hidden
      />
      <div className="mundos-herramientas-card__rim" aria-hidden />
      <span className="mundos-herramientas-card__sheen" aria-hidden />
      {children}
    </div>
  )
}

type MundosHerramientasCardProps = {
  eyebrow: string
  metric: string
  subject: string
  delta: string
  status: string
  spark: readonly string[]
  surface?: MundosHerramientasSurface
}

function MundosHerramientasCard({
  eyebrow,
  metric,
  subject,
  delta,
  status,
  spark,
  surface = "glass",
}: MundosHerramientasCardProps) {
  return (
    <MundosHerramientasCrystal surface={surface}>
      <div className="mundos-herramientas-card__chrome">
        <span>{eyebrow}</span>
      </div>

      <div className="mundos-herramientas-card__main">
        <div className="min-w-0">
          <p className="mundos-herramientas-card__metric">{metric}</p>
          <p className="mundos-herramientas-card__subject">{subject}</p>
        </div>
        <div className="mundos-herramientas-card__spark" aria-hidden>
          {spark.map((height, index) => (
            <span key={`${height}-${index}`} style={{ height }} />
          ))}
        </div>
      </div>

      <div className="mundos-herramientas-card__chrome">
        <span className="mundos-herramientas-card__delta">{delta}</span>
        <span>{status}</span>
      </div>
    </MundosHerramientasCrystal>
  )
}

const HERRAMIENTAS_CARD_DEMOS = [
  {
    eyebrow: "09 · Actualizar precios",
    metric: "$ 4.200,00",
    subject: "Agua mineral 2 L x6",
    delta: "$ 6.300,00 → $ 4.200,00",
    status: "Tarea completada",
    spark: SPARK_A,
  },
  {
    eyebrow: "02 · Consultar stock",
    metric: "42",
    subject: "Medialunas x6",
    delta: "18 individuales",
    status: "Consulta lista",
    spark: SPARK_B,
  },
] as const

export function MundosHerramientasCards() {
  return (
    <>
      {HERRAMIENTAS_CARD_DEMOS.map((demo) => (
        <MundosHerramientasCard key={`glass-${demo.eyebrow}`} {...demo} />
      ))}
      {HERRAMIENTAS_CARD_DEMOS.map((demo) => (
        <MundosHerramientasCard
          key={`flat-${demo.eyebrow}`}
          surface="flat"
          {...demo}
        />
      ))}
    </>
  )
}
