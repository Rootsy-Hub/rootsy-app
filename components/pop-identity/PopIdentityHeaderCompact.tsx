import { menuRealmTitleClass } from "@/lib/menu/menuHoloStyles"
import { buildPopLogoFallbackUrl } from "@/lib/popIdentityDisplay"
import { cn } from "@/lib/utils"

type Props = {
  name: string
  imageUrl?: string | null
  fallbackSeed?: string
  /** `dark` = chrome del workspace; `light` = espécimen de library. */
  tone?: "dark" | "light"
  className?: string
}

/** Header workspace · avatar cuadrado + nombre — `/library/logos` variant `header-compact`. */
export function PopIdentityHeaderCompact({
  name,
  imageUrl,
  fallbackSeed = "pop",
  tone = "dark",
  className,
}: Props) {
  const trimmedName = name.trim() || "Punto de venta"
  const logoSrc =
    imageUrl?.trim() || buildPopLogoFallbackUrl(fallbackSeed || trimmedName)
  const isDark = tone === "dark"

  return (
    <div className={cn("flex min-w-0 items-center gap-2.5", className)}>
      <div
        className={cn(
          "size-8 shrink-0 overflow-hidden rounded-lg ring-1",
          isDark ? "ring-[rgba(228,242,248,0.16)]" : "ring-border",
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} alt="" className="size-full object-cover" />
      </div>
      <span
        className={cn(
          "truncate text-sm font-semibold",
          isDark
            ? menuRealmTitleClass
            : "text-[var(--rootsy-bruma-900)]/90",
        )}
      >
        {trimmedName}
      </span>
    </div>
  )
}
