/** Mensaje corto para mostrar en formularios de checkout y venta. */
export function formatPadronErrorForUser(raw: string): string {
  const t = raw.toLowerCase()

  if (
    t.includes("computador no autorizado") ||
    t.includes("coe.notauthorized") ||
    t.includes("notauthorized") ||
    t.includes("loginfault")
  ) {
    return "No pudimos consultar ARCA. Revisá la configuración del certificado o contactá a soporte."
  }

  if (
    t.includes("no se encontró") ||
    t.includes("persona inscripta") ||
    t.includes("persona no encontrada")
  ) {
    return "No encontramos ese CUIT o DNI en ARCA."
  }

  if (t.includes("sin permiso")) {
    return raw
  }

  if (t.includes("cuit inválido") || t.includes("dni inválido")) {
    return raw
  }

  if (t.includes("ingresá un cuit")) {
    return raw
  }

  return "No pudimos obtener los datos en ARCA. Verificá el documento e intentá de nuevo."
}
