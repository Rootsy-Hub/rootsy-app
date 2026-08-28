"use client"

import {
  getIconButtonSpecStyle,
  resolveLegacyIconButtonSpec,
  resolveSemanticAppearance,
  type RootsButtonSpecShape,
} from "@/components/rootsy-button/rootsButtonSpecRuntime"
import {
  resolveRootsButtonAtmosphere,
  type RootsButtonAtmosphere,
} from "@/components/rootsy-button/rootsButtonAtmosphere"
import { useRootsButtonAtmosphere } from "@/components/rootsy-button/rootsButtonAtmosphereContext"
import {
  iconButtonSize,
  type IconButtonEmphasisId,
  type IconButtonRowIntentId,
  type IconButtonSizeId,
  type IconButtonThemeId,
} from "@/app/library/ui-components/buttonsUiHardcodedSpec"
import type {
  RootsButtonSemanticVariant,
  RootsIconButtonActionIntent,
  RootsIconButtonSize,
  RootsIconButtonSurface,
  RootsIconButtonTone,
} from "@/components/rootsy-button/rootsButtonStyles"
import { useRootsButtonInteraction } from "@/components/rootsy-button/useRootsButtonInteraction"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import { PopLink as Link } from "@/lib/pop-spa/PopLink"
import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  type Ref,
} from "react"

export type RootsIconButtonProps = {
  label: string
  /** Misma semántica que RootsSemanticButton. Si viene, manda sobre tone/emphasis. */
  semantic?: RootsButtonSemanticVariant
  /** default = radio del tamaño · pill = círculo. */
  shape?: RootsButtonSpecShape
  /** Luz del handbook. Si no viene, hereda del provider o de `theme`. */
  atmosphere?: RootsButtonAtmosphere
  tone?: RootsIconButtonTone
  intent?: RootsIconButtonActionIntent
  surface?: RootsIconButtonSurface
  size?: RootsIconButtonSize
  /** @deprecated Preferí `atmosphere`. workspace = bruma · pos = sombra. */
  theme?: IconButtonThemeId
  emphasis?: IconButtonEmphasisId
  rowIntent?: IconButtonRowIntentId
  loading?: boolean
  /** Navegación — renderiza `<Link>` con el mismo chrome del icon button. */
  href?: string
  /** Por defecto escala el hijo al token de ícono; desactivar para triggers custom (avatar). */
  sizeChildren?: boolean
  children: ReactNode
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "aria-label">

type IconChildProps = {
  className?: string
  style?: CSSProperties
  size?: number
  width?: number
  height?: number
  "aria-hidden"?: boolean
}

function renderSizedIcon(child: ReactNode, iconPx: number): ReactNode {
  const onlyChild = Children.only(child)
  if (!isValidElement<IconChildProps>(onlyChild)) return onlyChild

  return cloneElement(onlyChild, {
    size: iconPx,
    width: iconPx,
    height: iconPx,
    className: cn(onlyChild.props.className),
    style: {
      ...(onlyChild.props.style ?? {}),
      width: iconPx,
      height: iconPx,
      minWidth: iconPx,
      minHeight: iconPx,
    },
    "aria-hidden": onlyChild.props["aria-hidden"] ?? true,
  })
}

export const RootsIconButton = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  RootsIconButtonProps
>(
  function RootsIconButton(
    {
      label,
      semantic,
      shape = "default",
      atmosphere,
      tone = "light",
      intent = "edit",
      surface = "light",
      size = "default",
      theme,
      emphasis,
      rowIntent,
      loading = false,
      disabled,
      href,
      sizeChildren = true,
      className,
      style,
      type = "button",
      children,
      onMouseEnter,
      onMouseLeave,
      onFocus,
      onBlur,
      onMouseDown,
      onMouseUp,
      onPointerDown,
      onPointerUp,
      onPointerCancel,
      onKeyDown,
      onKeyUp,
      ...rest
    },
    ref,
  ) {
    const inheritedAtmosphere = useRootsButtonAtmosphere(atmosphere)
    const resolvedAtmosphere = resolveRootsButtonAtmosphere({
      atmosphere: inheritedAtmosphere,
      theme,
    })
    const { state, interactionHandlers } = useRootsButtonInteraction({
      disabled,
      loading,
    })

    const appearance = semantic ? resolveSemanticAppearance(semantic) : undefined
    const spec =
      appearance
        ? { kind: "appearance" as const }
        : theme && emphasis
          ? { kind: "theme" as const, theme, emphasis }
          : rowIntent
            ? { kind: "row" as const, rowIntent }
            : resolveLegacyIconButtonSpec({ tone, surface, intent })

    const buttonStyle =
      spec.kind === "appearance"
        ? getIconButtonSpecStyle({
            appearance: appearance!,
            sizeId: size as IconButtonSizeId,
            state,
            shape,
            atmosphere: resolvedAtmosphere,
            theme,
          })
        : spec.kind === "row"
          ? getIconButtonSpecStyle({
              rowIntent: spec.rowIntent,
              sizeId: size as IconButtonSizeId,
              state,
              shape,
              atmosphere: resolvedAtmosphere,
              theme,
            })
          : getIconButtonSpecStyle({
              theme: spec.theme,
              emphasis: spec.emphasis,
              sizeId: size as IconButtonSizeId,
              state,
              shape,
              atmosphere: resolvedAtmosphere,
            })

    const iconPx = iconButtonSize(size as IconButtonSizeId).iconPx
    const isDisabled = Boolean(disabled || loading)
    const chromeClassName = cn(
      "appearance-none disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:text-current",
      isDisabled && href && "pointer-events-none opacity-40",
      className,
    )
    const chromeStyle = { ...buttonStyle, ...style }

    const content = loading ? (
      <Loader2
        className="animate-spin"
        style={{ width: iconPx, height: iconPx }}
        aria-hidden
      />
    ) : sizeChildren ? (
      renderSizedIcon(children, iconPx)
    ) : (
      children
    )

    const interactionProps = {
      className: chromeClassName,
      style: chromeStyle,
      "data-rootsy-appearance": appearance,
      "data-rootsy-atmosphere": resolvedAtmosphere,
      "data-rootsy-shape": shape,
      onMouseEnter: (event: MouseEvent<HTMLElement>) => {
        interactionHandlers.onMouseEnter()
        onMouseEnter?.(event as MouseEvent<HTMLButtonElement>)
      },
      onMouseLeave: (event: MouseEvent<HTMLElement>) => {
        interactionHandlers.onMouseLeave()
        onMouseLeave?.(event as MouseEvent<HTMLButtonElement>)
      },
      onFocus: (event: FocusEvent<HTMLElement>) => {
        interactionHandlers.onFocus(event as FocusEvent<HTMLButtonElement>)
        onFocus?.(event as FocusEvent<HTMLButtonElement>)
      },
      onBlur: (event: FocusEvent<HTMLElement>) => {
        interactionHandlers.onBlur()
        onBlur?.(event as FocusEvent<HTMLButtonElement>)
      },
      onPointerDown: (event: PointerEvent<HTMLElement>) => {
        interactionHandlers.onPointerDown()
        onPointerDown?.(event as PointerEvent<HTMLButtonElement>)
      },
      onPointerUp: (event: PointerEvent<HTMLElement>) => {
        interactionHandlers.onPointerUp()
        onPointerUp?.(event as PointerEvent<HTMLButtonElement>)
      },
      onPointerCancel: (event: PointerEvent<HTMLElement>) => {
        interactionHandlers.onPointerCancel()
        onPointerCancel?.(event as PointerEvent<HTMLButtonElement>)
      },
      onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
        interactionHandlers.onKeyDown(event as KeyboardEvent<HTMLButtonElement>)
        onKeyDown?.(event as KeyboardEvent<HTMLButtonElement>)
      },
      onKeyUp: (event: KeyboardEvent<HTMLElement>) => {
        interactionHandlers.onKeyUp(event as KeyboardEvent<HTMLButtonElement>)
        onKeyUp?.(event as KeyboardEvent<HTMLButtonElement>)
      },
    }

    if (href && !isDisabled) {
      const linkRest = rest as Omit<
        AnchorHTMLAttributes<HTMLAnchorElement>,
        keyof typeof interactionProps | "href" | "aria-label"
      >
      return (
        <Link
          ref={ref as Ref<HTMLAnchorElement>}
          href={href}
          aria-label={label}
          {...interactionProps}
          {...linkRest}
        >
          {content}
        </Link>
      )
    }

    return (
      <button
        ref={ref as Ref<HTMLButtonElement>}
        type={type}
        aria-label={label}
        disabled={isDisabled}
        {...interactionProps}
        {...rest}
      >
        {content}
      </button>
    )
  },
)
