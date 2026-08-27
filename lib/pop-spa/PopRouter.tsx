"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
  type ReactNode,
} from "react"
import {
  useParams as useNextParams,
  usePathname as useNextPathname,
  useRouter as useNextRouter,
  useSearchParams as useNextSearchParams,
} from "next/navigation"
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"
import {
  hrefToString,
  isPopInternalPath,
  popIdsFromPathname,
  resolvePopHref,
  resolvedHrefToString,
  type PopHrefInput,
} from "@/lib/pop-spa/href"
import { matchPopRoute } from "@/lib/pop-spa/matchPopRoute"
import { preloadPopHref } from "@/lib/pop-spa/preload"

type PopLocation = {
  pathname: string
  search: string
}

type NavigateOptions = { scroll?: boolean }

type PopRouterApi = {
  pathname: string
  search: string
  params: Record<string, string>
  siteId: string
  popId: string
  spaActive: boolean
  push: (href: PopHrefInput, options?: NavigateOptions) => void
  replace: (href: PopHrefInput, options?: NavigateOptions) => void
  prefetch: (href: PopHrefInput) => void
  back: () => void
  forward: () => void
}

const PopRouterContext = createContext<PopRouterApi | null>(null)

function readWindowLocation(): PopLocation | null {
  if (typeof window === "undefined") return null
  return {
    pathname: window.location.pathname,
    search: window.location.search.replace(/^\?/, ""),
  }
}

export function PopRouterProvider({ children }: { children: ReactNode }) {
  const nextPathname = useNextPathname()
  const nextSearchParams = useNextSearchParams()
  const [spa, setSpa] = useState<PopLocation | null>(null)
  const [spaActive, setSpaActive] = useState(false)

  const pathname = spa?.pathname ?? nextPathname
  const search = spa?.search ?? nextSearchParams.toString()
  const { siteId, popId } = popIdsFromPathname(pathname)
  const match = useMemo(() => matchPopRoute(pathname), [pathname])

  const apply = useCallback(
    (next: PopLocation, mode: "push" | "replace", scroll?: boolean) => {
      const url = resolvedHrefToString({
        pathname: next.pathname,
        search: next.search,
        hash: "",
      })
      if (mode === "replace") {
        window.history.replaceState(window.history.state, "", url)
      } else {
        window.history.pushState(window.history.state, "", url)
      }
      setSpa(next)
      if (next.pathname !== pathname) {
        setSpaActive(true)
      }
      if (scroll !== false && next.pathname !== pathname) {
        window.scrollTo(0, 0)
      }
    },
    [pathname],
  )

  const navigate = useCallback(
    (href: PopHrefInput, mode: "push" | "replace", options?: NavigateOptions) => {
      const resolved = resolvePopHref(href, pathname, search)
      apply(
        { pathname: resolved.pathname, search: resolved.search },
        mode,
        options?.scroll,
      )
    },
    [apply, pathname, search],
  )

  useEffect(() => {
    const onPopState = () => {
      const loc = readWindowLocation()
      if (loc) {
        setSpa(loc)
        setSpaActive(true)
      }
    }
    window.addEventListener("popstate", onPopState)
    return () => window.removeEventListener("popstate", onPopState)
  }, [])

  const value = useMemo((): PopRouterApi => {
    return {
      pathname,
      search,
      params: match.params,
      siteId,
      popId,
      spaActive,
      push: (href, options) => navigate(href, "push", options),
      replace: (href, options) => navigate(href, "replace", options),
      prefetch: (href) => {
        const resolved = resolvePopHref(href, pathname, search)
        if (!isPopInternalPath(resolved.pathname, siteId, popId)) return
        preloadPopHref(resolved.pathname)
      },
      back: () => window.history.back(),
      forward: () => window.history.forward(),
    }
  }, [match.params, navigate, pathname, popId, search, siteId, spaActive])

  return (
    <PopRouterContext.Provider value={value}>{children}</PopRouterContext.Provider>
  )
}

export function usePopRouterOptional(): PopRouterApi | null {
  return useContext(PopRouterContext)
}

export function usePopRouter(): PopRouterApi {
  const ctx = useContext(PopRouterContext)
  if (!ctx) {
    throw new Error("usePopRouter debe usarse dentro de PopRouterProvider")
  }
  return ctx
}

export function usePathname(): string {
  const pop = usePopRouterOptional()
  const nextPathname = useNextPathname()
  return pop?.pathname ?? nextPathname
}

export function useSearchParams(): URLSearchParams {
  const pop = usePopRouterOptional()
  const nextSearchParams = useNextSearchParams()
  const search = pop?.search ?? nextSearchParams.toString()
  return useMemo(() => new URLSearchParams(search), [search])
}

export function useParams(): Record<string, string | string[] | undefined> {
  const pop = usePopRouterOptional()
  const nextParams = useNextParams()
  return pop?.params ?? nextParams
}

export function useRouter(): AppRouterInstance {
  const pop = usePopRouterOptional()
  const nextRouter = useNextRouter()

  return useMemo(() => {
    if (!pop) return nextRouter

    const wrap = (
      href: PopHrefInput,
      options: NavigateOptions | undefined,
      mode: "push" | "replace",
    ) => {
      const resolved = resolvePopHref(href, pop.pathname, pop.search)
      if (isPopInternalPath(resolved.pathname, pop.siteId, pop.popId)) {
        if (mode === "replace") pop.replace(href, options)
        else pop.push(href, options)
        return
      }
      const asString = hrefToString(href)
      if (mode === "replace") nextRouter.replace(asString, options)
      else nextRouter.push(asString, options)
    }

    return {
      ...nextRouter,
      push: (href, options) => wrap(href, options, "push"),
      replace: (href, options) => wrap(href, options, "replace"),
      prefetch: (href) => {
        const resolved = resolvePopHref(href, pop.pathname, pop.search)
        if (isPopInternalPath(resolved.pathname, pop.siteId, pop.popId)) {
          pop.prefetch(href)
          return
        }
        return nextRouter.prefetch(hrefToString(href))
      },
      back: () => pop.back(),
      forward: () => pop.forward(),
    }
  }, [nextRouter, pop])
}
