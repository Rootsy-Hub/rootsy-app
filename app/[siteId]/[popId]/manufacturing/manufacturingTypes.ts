export type ManufacturingIngredientPreview = {
  articleId: string
  articleName: string
  itemKind: "merchandise" | "raw_material" | "supply"
  unitOfMeasure: string
  quantityPerUnit: number
  wastePct: number | null
  consumeQty: number
  onHand: number
}

export type ManufacturableRecipe = {
  id: string
  name: string
  outputArticleId: string
  outputArticleName: string
  outputUnitOfMeasure: string
  allowNegativeStock: boolean
  ingredients: ManufacturingIngredientPreview[]
}

export type ManufacturingRunRow = {
  id: string
  producedAt: string
  recipeId: string
  recipeName: string
  outputArticleId: string
  outputArticleName: string
  outputUnitOfMeasure: string
  quantity: number
  unitCost: number
  totalCost: number
  expiresAt: string | null
  producedByName: string
}

export type ManufacturingWorkspaceData = {
  runs: ManufacturingRunRow[]
  recipes: ManufacturableRecipe[]
  canCreate: boolean
}
