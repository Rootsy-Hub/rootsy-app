/** Frase que el usuario debe escribir para confirmar borrado de una cuenta. */
export function treasuryAccountDeleteConfirmPhrase(accountName: string): string {
  const name = accountName.trim() || "esta cuenta"
  return `Eliminar ${name}`
}
