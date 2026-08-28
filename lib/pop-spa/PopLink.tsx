"use client"

import NextLink from "next/link"
import {
  forwardRef,
  type ComponentProps,
  type MouseEvent,
} from "react"
import {
  hrefToString,
  isModifiedClick,
  isPopInternalPath,
  resolvePopHref,
  type PopHrefInput,
} from "@/lib/pop-spa/href"
import { preloadPopHref } from "@/lib/pop-spa/preload"
import { usePopRouterOptional } from "@/lib/pop-spa/PopRouter"

type PopLinkProps = ComponentProps<typeof NextLink>

export const PopLink = forwardRef<HTMLAnchorElement, PopLinkProps>(
  function PopLink(
    { href, replace, scroll, onClick, onMouseEnter, prefetch, ...rest },
    ref,
  ) {
    const pop = usePopRouterOptional()
    const hrefString = hrefToString(href as PopHrefInput)

    const handleMouseEnter = (event: MouseEvent<HTMLAnchorElement>) => {
      onMouseEnter?.(event)
      if (!pop) return
      const resolved = resolvePopHref(href as PopHrefInput, pop.pathname, pop.search)
      if (!isPopInternalPath(resolved.pathname, pop.siteId, pop.popId)) return
      preloadPopHref(resolved.pathname)
    }

    if (pop) {
      const resolved = resolvePopHref(href as PopHrefInput, pop.pathname, pop.search)
      if (isPopInternalPath(resolved.pathname, pop.siteId, pop.popId)) {
        return (
          <a
            ref={ref}
            href={hrefString}
            onMouseEnter={handleMouseEnter}
            onClick={(event) => {
              onClick?.(event)
              if (event.defaultPrevented || isModifiedClick(event)) return
              event.preventDefault()
              if (replace) pop.replace(href as PopHrefInput, { scroll })
              else pop.push(href as PopHrefInput, { scroll })
            }}
            {...rest}
          />
        )
      }
    }

    return (
      <NextLink
        ref={ref}
        href={href}
        replace={replace}
        scroll={scroll}
        prefetch={prefetch}
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        {...rest}
      />
    )
  },
)

export default PopLink
