let preloadHref: (href: string) => void = () => {}
let preloadIdle: () => void = () => {}
let bound = false
let binding: Promise<void> | null = null
const queuedHrefs = new Set<string>()
let idleQueued = false

export function bindPopSpaPreload(handlers: {
  href: (href: string) => void
  idle: () => void
}) {
  preloadHref = handlers.href
  preloadIdle = handlers.idle
  bound = true
  for (const href of queuedHrefs) handlers.href(href)
  queuedHrefs.clear()
  if (idleQueued) {
    idleQueued = false
    handlers.idle()
  }
}

function ensureBound() {
  if (bound || binding) return binding
  binding = import("@/lib/pop-spa/popModuleLoaders").then(() => undefined)
  return binding
}

export function ensurePopSpaPreloadBound() {
  void ensureBound()
}

export function preloadPopHref(href: string) {
  if (bound) {
    preloadHref(href)
    return
  }
  queuedHrefs.add(href)
  void ensureBound()
}

export function preloadPopIdleViews() {
  if (bound) {
    preloadIdle()
    return
  }
  idleQueued = true
  void ensureBound()
}
