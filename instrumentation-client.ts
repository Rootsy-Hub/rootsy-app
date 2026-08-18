const REACT_DEVTOOLS_BUG_MARKERS = [
  "react instrumentation encountered an error",
  "cleaning up async info that was not on the parent suspense boundary",
  "fmkadmapgofadopljbjfkapdkoienihi",
] as const

const SUPPRESSOR_SYMBOL = Symbol.for("rootsy.suppressReactDevtoolsNoise")

function textIncludesKnownBug(text: string): boolean {
  const lower = text.toLowerCase()
  return REACT_DEVTOOLS_BUG_MARKERS.some((marker) => lower.includes(marker))
}

function argIncludesKnownBug(arg: unknown): boolean {
  if (typeof arg === "string") return textIncludesKnownBug(arg)
  if (arg instanceof Error) {
    return textIncludesKnownBug(`${arg.name} ${arg.message}`)
  }
  return false
}

function argsIncludeKnownBug(args: unknown[]): boolean {
  return args.some(argIncludesKnownBug)
}

function wrapConsoleMethod(method: "error" | "warn") {
  const current = console[method]
  if ((current as { [SUPPRESSOR_SYMBOL]?: boolean })[SUPPRESSOR_SYMBOL]) {
    return
  }

  const previous = current.bind(console)
  const wrapped = (...args: unknown[]) => {
    if (argsIncludeKnownBug(args)) return
    previous(...args)
  }
  ;(wrapped as { [SUPPRESSOR_SYMBOL]: boolean })[SUPPRESSOR_SYMBOL] = true
  console[method] = wrapped
}

/**
 * React DevTools' installHook.js logs a cosmetic Suspense warning in dev when
 * the extension is installed. Next.js forwards browser console.error to the
 * terminal after instrumentation-client runs, so we re-apply this filter until
 * our wrapper sits above Next's forwarder.
 */
export function suppressReactDevtoolsAsyncBoundaryWarning() {
  if (process.env.NODE_ENV !== "development" || typeof window === "undefined") {
    return
  }

  wrapConsoleMethod("error")
  wrapConsoleMethod("warn")
}

suppressReactDevtoolsAsyncBoundaryWarning()

if (typeof window !== "undefined") {
  requestAnimationFrame(suppressReactDevtoolsAsyncBoundaryWarning)
  window.setTimeout(suppressReactDevtoolsAsyncBoundaryWarning, 0)
  window.setTimeout(suppressReactDevtoolsAsyncBoundaryWarning, 50)
  window.setTimeout(suppressReactDevtoolsAsyncBoundaryWarning, 250)
}

export function onRouterTransitionStart() {
  suppressReactDevtoolsAsyncBoundaryWarning()
}
