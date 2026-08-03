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
