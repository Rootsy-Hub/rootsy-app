/** Frase que el usuario debe escribir para confirmar borrado de un cliente. */
export function clientDeleteConfirmPhrase(clientName: string): string {
  const name = clientName.trim() || "este cliente"
  return `Eliminar ${name}`
}
