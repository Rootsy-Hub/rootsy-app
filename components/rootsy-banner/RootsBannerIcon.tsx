import {
  getBannerIconStyle,
  type BannerIntentId,
} from "@/components/rootsy-banner/rootsBannerSpecRuntime"
import { rootsySpacePx } from "@/lib/design-system"

export function RootsBannerIcon({ intent }: { intent: BannerIntentId }) {
  const style = getBannerIconStyle(intent)
  const size = rootsySpacePx("200")

  if (intent === "success") {
    return (
      <svg viewBox="0 0 16 16" fill="none" style={style} aria-hidden>
        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.25" />
        <path
          d="M5 8l2 2 4-4"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  if (intent === "danger") {
    return (
      <svg viewBox="0 0 16 16" fill="none" style={style} aria-hidden>
        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.25" />
        <path d="M8 5v4M8 11h.01" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      </svg>
    )
  }

  if (intent === "warning") {
    return (
      <svg viewBox="0 0 16 16" fill="none" style={style} aria-hidden>
        <path
          d="M8 2.5L14.5 13H1.5L8 2.5Z"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinejoin="round"
        />
        <path d="M8 6.5v3M8 11h.01" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      </svg>
    )
  }

  if (intent === "info") {
    return (
      <svg viewBox="0 0 16 16" fill="none" style={style} aria-hidden>
        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.25" />
        <path d="M8 7v4M8 5.5h.01" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 16 16" fill="none" style={style} width={size} height={size} aria-hidden>
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.25" />
      <path d="M8 7.5v3.5M8 5.5h.01" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  )
}
