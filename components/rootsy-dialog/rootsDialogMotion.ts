/** Duración de salida de `Dialog` / `AlertDialog` (`duration-200` + margen). */
export const ROOTS_DIALOG_EXIT_ANIMATION_MS = 220

/** Ejecuta una acción después de que termine la animación de cierre del diálogo. */
export function deferAfterDialogClose(action: () => void): () => void {
  const id = window.setTimeout(action, ROOTS_DIALOG_EXIT_ANIMATION_MS)
  return () => window.clearTimeout(id)
}
