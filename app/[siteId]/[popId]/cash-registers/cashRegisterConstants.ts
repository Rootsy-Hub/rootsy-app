/** Frase que el usuario debe escribir para confirmar borrado de una caja. */
export function cashRegisterDeleteConfirmPhrase(registerName: string): string {
  const name = registerName.trim() || "esta caja"
  return `Eliminar ${name}`
}
