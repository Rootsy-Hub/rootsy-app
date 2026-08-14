"use client"

import {
  useCallback,
  useEffect,
  useState,
  type HTMLAttributes,
  type RefObject,
} from "react"

function getScrollParent(node: HTMLElement): HTMLElement | null {
  let parent = node.parentElement

  while (parent) {
    const { overflowY } = getComputedStyle(parent)
    if (
      (overflowY === "auto" || overflowY === "scroll") &&
      parent.scrollHeight > parent.clientHeight
    ) {
      return parent
    }
    parent = parent.parentElement
  }

  return null
}

function isTableHeaderScrolled(node: HTMLElement): boolean {
  const header = node.querySelector<HTMLElement>("[data-slot=table-header]")
  const firstRow = node.querySelector<HTMLElement>(
    "[data-slot=table-body] [data-slot=table-row]",
  )

  if (!header || !firstRow) {
    const scrollParent = getScrollParent(node) ?? node
    return scrollParent.scrollTop > 0
  }

  return firstRow.getBoundingClientRect().top < header.getBoundingClientRect().bottom - 0.5
}

export function useWorkspaceTableListScrollState(
  forwardedRef?: RefObject<HTMLDivElement | null>,
) {
  const [scrolled, setScrolled] = useState(false)
  const [node, setNode] = useState<HTMLDivElement | null>(null)

  const setRef = useCallback(
    (el: HTMLDivElement | null) => {
      if (forwardedRef) {
        forwardedRef.current = el
      }
      setNode(el)
    },
    [forwardedRef],
  )

  useEffect(() => {
    if (!node) return

    const scrollParent = getScrollParent(node) ?? node

    const sync = () => {
      setScrolled(isTableHeaderScrolled(node))
    }

    sync()
    scrollParent.addEventListener("scroll", sync, { passive: true })
    window.addEventListener("resize", sync)

    const mutationObserver = new MutationObserver(sync)
    mutationObserver.observe(node, { childList: true, subtree: true })

    return () => {
      scrollParent.removeEventListener("scroll", sync)
      window.removeEventListener("resize", sync)
      mutationObserver.disconnect()
    }
  }, [node])

  const scrollProps = {
    "data-table-scrolled": scrolled ? "true" : "false",
  } satisfies HTMLAttributes<HTMLDivElement>

  return { setRef, scrollProps, scrolled }
}
