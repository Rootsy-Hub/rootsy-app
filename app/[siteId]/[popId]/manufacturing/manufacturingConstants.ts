import type { ArticleItemKind } from "@/lib/articleItemKind"

function pluralize(count: number, one: string, many: string) {
  return `${count} ${count === 1 ? one : many}`
}

function phraseUnit(unitOfMeasure: string, quantity: number): string {
  const unit = unitOfMeasure.trim()
  if (unit === "unidad" || !unit) {
    return quantity === 1 ? "unidad" : "unidades"
  }
  if (unit === "caja") return quantity === 1 ? "caja" : "cajas"
  if (unit === "lt") return quantity === 1 ? "litro" : "litros"
  if (unit === "kg") return "kg"
  if (unit === "g") return quantity === 1 ? "gramo" : "gramos"
  if (unit === "ml") return "ml"
  return unit.toLowerCase()
}

function kindPart(
  count: number,
  kind: ArticleItemKind,
): string | null {
  if (count <= 0) return null
  if (kind === "raw_material") {
    return pluralize(count, "materia prima", "materias primas")
  }
  if (kind === "supply") {
    return pluralize(count, "insumo", "insumos")
  }
  return pluralize(count, "producto", "productos")
}

export function countManufacturingIngredientKinds(
  itemKinds: ReadonlyArray<string>,
): { rawMaterial: number; supply: number; merchandise: number } {
  let rawMaterial = 0
  let supply = 0
  let merchandise = 0
  for (const kind of itemKinds) {
    if (kind === "raw_material") rawMaterial += 1
    else if (kind === "supply") supply += 1
    else if (kind === "merchandise") merchandise += 1
    else rawMaterial += 1
  }
  return { rawMaterial, supply, merchandise }
}

/** Frase que hay que copiar para confirmar una fabricación. */
export function manufacturingConfirmPhrase(input: {
  quantity: number
  unitOfMeasure: string
  itemKinds: ReadonlyArray<string>
}): string {
  const qty = Number.isFinite(input.quantity)
    ? Math.max(0, Math.round(input.quantity))
    : 0
  const unit = phraseUnit(input.unitOfMeasure, qty)
  const counts = countManufacturingIngredientKinds(input.itemKinds)
  const deductParts = [
    kindPart(counts.rawMaterial, "raw_material"),
    kindPart(counts.supply, "supply"),
    kindPart(counts.merchandise, "merchandise"),
  ].filter((part): part is string => Boolean(part))

  const make = `Estoy seguro de fabricar ${qty} ${unit}`
  if (deductParts.length === 0) return make
  if (deductParts.length === 1) {
    return `${make} y descontar ${deductParts[0]}`
  }
  if (deductParts.length === 2) {
    return `${make} y descontar ${deductParts[0]} y ${deductParts[1]}`
  }
  return `${make} y descontar ${deductParts[0]}, ${deductParts[1]} y ${deductParts[2]}`
}
