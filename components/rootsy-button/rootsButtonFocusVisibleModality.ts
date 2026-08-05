/**
 * Modalidad de foco para botones — el estado focus de la spec solo aplica con focus-visible.
 */

let keyboardFocusModality = false
let listenersAttached = false

function attachFocusModalityListeners() {
  if (listenersAttached || typeof window === "undefined") return
  listenersAttached = true

  window.addEventListener(
    "keydown",
    (event) => {
      if (event.metaKey || event.altKey || event.ctrlKey) return
      if (
        event.key === "Tab" ||
        event.key.startsWith("Arrow") ||
        event.key === "Enter" ||
        event.key === " "
      ) {
        keyboardFocusModality = true
      }
    },
    true,
  )

  window.addEventListener(
    "pointerdown",
    () => {
      keyboardFocusModality = false
    },
    true,
  )
}

export function shouldApplyButtonFocusVisible(target: HTMLElement): boolean {
  attachFocusModalityListeners()
  return keyboardFocusModality || target.matches(":focus-visible")
}
