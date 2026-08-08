/** Frase que el usuario debe escribir para confirmar borrado de un proveedor. */
export function supplierDeleteConfirmPhrase(supplierName: string): string {
  const name = supplierName.trim() || "este proveedor"
  return `Eliminar ${name}`
}
