"use client"

import { cn } from "@/lib/utils"
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react"

type Props = {
  text: string
  active: boolean
  className?: string
}

export function CartItemTitleMarquee({ text, active, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const ghostRef = useRef<HTMLSpanElement>(null)
  const prevActiveRef = useRef(false)
  const [truncated, setTruncated] = useState(false)
  const [marqueeKey, setMarqueeKey] = useState(0)
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduceMotion(mq.matches)
    const fn = () => setReduceMotion(mq.matches)
    mq.addEventListener("change", fn)
    return () => mq.removeEventListener("change", fn)
  }, [])

  const syncMeasure = useCallback(() => {
    const c = containerRef.current
    const g = ghostRef.current
    if (!c || !g || !text) {
      setTruncated(false)
      return
    }
    setTruncated(g.scrollWidth > c.clientWidth + 1)
  }, [text])

  useLayoutEffect(() => {
    if (!active || !text) {
      setTruncated(false)
      prevActiveRef.current = active
      return
    }
    if (active && !prevActiveRef.current) {
      setMarqueeKey((k) => k + 1)
    }
    prevActiveRef.current = active
    syncMeasure()
    const id = requestAnimationFrame(syncMeasure)
    return () => cancelAnimationFrame(id)
  }, [active, text, syncMeasure])

  useEffect(() => {
    if (!active || !text) return
    const c = containerRef.current
    if (!c || typeof ResizeObserver === "undefined") return
    const ro = new ResizeObserver(syncMeasure)
    ro.observe(c)
    return () => ro.disconnect()
  }, [active, text, syncMeasure])

  if (!text) return null

  const durationSec = Math.min(28, Math.max(12, text.length * 0.42))
  const marqueeStyle = {
    "--rootsy-cart-marquee-duration": `${durationSec}s`,
  } as CSSProperties

  const ghost = (
    <span
      ref={ghostRef}
      className={cn(
        "pointer-events-none absolute top-0 left-0 max-w-none whitespace-nowrap opacity-0",
        className,
      )}
      aria-hidden
    >
      {text}
    </span>
  )

  const segment = (duplicate: boolean) => (
    <span
      className="inline-flex shrink-0 items-center"
      aria-hidden={duplicate ? true : undefined}
    >
      <span className={className}>{text}</span>
      <span className="inline-flex h-5 min-w-10 shrink-0 items-center justify-center px-1 text-sm font-medium text-[#8a9aaf]">
        ·
      </span>
    </span>
  )

  if (!active) {
    return (
      <div ref={containerRef} className="relative min-w-0 overflow-hidden">
        {ghost}
        <p className={cn("line-clamp-1", className)}>{text}</p>
      </div>
    )
  }

  if (reduceMotion && truncated) {
    return (
      <div ref={containerRef} className="relative min-w-0 overflow-hidden">
        {ghost}
        <p className={cn("wrap-break-word", className)}>{text}</p>
      </div>
    )
  }

  if (!truncated) {
    return (
      <div ref={containerRef} className="relative min-w-0 overflow-hidden">
        {ghost}
        <p className={cn("line-clamp-1", className)}>{text}</p>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative min-w-0 overflow-hidden">
      {ghost}
      <div className="rootsy-cart-item-marquee-fade overflow-hidden">
        <div
          key={marqueeKey}
          className="rootsy-cart-title-marquee-track"
          style={marqueeStyle}
        >
          {segment(false)}
          {segment(true)}
        </div>
      </div>
    </div>
  )
}
