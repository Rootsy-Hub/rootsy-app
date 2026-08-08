import Link from "next/link"
import { cva, type VariantProps } from "class-variance-authority"
import type { ComponentPropsWithoutRef } from "react"
import { cn } from "@/lib/utils"

/**
 * Botón tipo "pill" reutilizable, basado en los botones del diseño de Figma.
 * - `primary`: fondo blanco, texto navy (CTA "Contratar" / "Iniciar sesión").
 * - `outline`: transparente con borde blanco (CTA "Agendar una demo").
 */
export const pillButtonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full font-sans font-bold tracking-[-0.03em] leading-none transition duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-meadow/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080c0b] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-white text-[#000347] shadow-[0_14px_40px_-18px_rgba(255,255,255,0.5)] hover:bg-white/90",
        outline:
          "border-2 border-white/45 bg-transparent text-white hover:border-white/70 hover:bg-white/5",
      },
      size: {
        md: "h-10 px-4 text-sm",
        lg: "h-11 px-5 text-[0.9375rem]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "lg",
    },
  },
)

type PillButtonBaseProps = VariantProps<typeof pillButtonVariants> & {
  className?: string
}

type PillButtonAsButton = PillButtonBaseProps &
  ComponentPropsWithoutRef<"button"> & { href?: undefined }

type PillButtonAsLink = PillButtonBaseProps &
  Omit<ComponentPropsWithoutRef<typeof Link>, "href"> & { href: string }

export type PillButtonProps = PillButtonAsButton | PillButtonAsLink

export function PillButton({
  variant,
  size,
  className,
  ...props
}: PillButtonProps) {
  const classes = cn(pillButtonVariants({ variant, size }), className)

  if (typeof props.href === "string") {
    const { href, ...rest } = props as PillButtonAsLink
    return <Link href={href} className={classes} {...rest} />
  }

  const { href: _href, ...rest } = props as PillButtonAsButton
  return <button className={classes} {...rest} />
}
