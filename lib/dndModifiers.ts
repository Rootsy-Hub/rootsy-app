import type { Modifier } from "@dnd-kit/core"

function getEventCoordinates(
  event: Event,
): { x: number; y: number } | null {
  if (event instanceof MouseEvent) {
    return { x: event.clientX, y: event.clientY }
  }

  if (event instanceof TouchEvent && event.touches.length > 0) {
    return { x: event.touches[0].clientX, y: event.touches[0].clientY }
  }

  return null
}

export const snapCenterToCursor: Modifier = ({
  activatorEvent,
  draggingNodeRect,
  overlayNodeRect,
  transform,
}) => {
  const rect = overlayNodeRect ?? draggingNodeRect
  if (!rect || !activatorEvent) return transform

  const coords = getEventCoordinates(activatorEvent)
  if (!coords) return transform

  return {
    ...transform,
    x: transform.x + coords.x - rect.left - rect.width / 2,
    y: transform.y + coords.y - rect.top - rect.height / 2,
  }
}

/** Mantiene bajo el cursor el punto exacto donde se agarró (p. ej. el handle). */
export const snapGrabPointToCursor: Modifier = ({
  activatorEvent,
  activeNodeRect,
  draggingNodeRect,
  overlayNodeRect,
  transform,
}) => {
  const layoutRect = activeNodeRect ?? draggingNodeRect
  const rect = overlayNodeRect ?? layoutRect
  if (!layoutRect || !rect || !activatorEvent) return transform

  const coords = getEventCoordinates(activatorEvent)
  if (!coords) return transform

  const grabOffsetX = coords.x - layoutRect.left
  const grabOffsetY = coords.y - layoutRect.top

  return {
    ...transform,
    x: transform.x + coords.x - rect.left - grabOffsetX,
    y: transform.y + coords.y - rect.top - grabOffsetY,
  }
}
