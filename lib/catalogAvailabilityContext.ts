import {
  applyAvailabilityToProduct,
  isCatalogStockStale,
  projectArticleAvailability,
  projectComboAvailability,
  projectRecipeAvailability,
  type ArticleStockSnap,
  type CatalogAvailability,
  type RecipeAvailabilityPlan,
} from "@/lib/catalogAvailability"
import type { MenuCatalogProduct } from "@/lib/menuCatalogProduct"
import type { PopLocalDatabase } from "@/lib/popLocalDb/database"
import { listAllRecipes } from "@/lib/popLocalDb/recipesRepo"
import {
  listAllRecipeIngredients,
  listArticleStockSnaps,
} from "@/lib/popLocalDb/recipeIngredientsRepo"

export type CatalogAvailabilityContext = {
  stockByArticleId: Map<string, ArticleStockSnap>
  recipes: Map<string, RecipeAvailabilityPlan>
  stale: boolean
}

export function buildCatalogAvailabilityContext(
  db: PopLocalDatabase,
): CatalogAvailabilityContext {
  const stockByArticleId = new Map<string, ArticleStockSnap>()
  for (const row of listArticleStockSnaps(db)) {
    stockByArticleId.set(row.id, {
      stockOnHand: row.stockOnHand,
      allowNegativeStock: row.allowNegativeStock,
    })
  }

  const ingredientsByRecipe = new Map<
    string,
    RecipeAvailabilityPlan["ingredients"]
  >()
  for (const row of listAllRecipeIngredients(db)) {
    const list = ingredientsByRecipe.get(row.recipeId) ?? []
    list.push({
      articleId: row.articleId,
      quantity: row.quantity,
      wastePct: row.wastePct,
      defaultWastePct: row.articleDefaultWastePct,
    })
    ingredientsByRecipe.set(row.recipeId, list)
  }

  const recipes = new Map<string, RecipeAvailabilityPlan>()
  for (const recipe of listAllRecipes(db)) {
    recipes.set(recipe.id, {
      allowNegative: recipe.allowNegativeStock,
      outputArticleId: recipe.outputArticleId,
      ingredients: ingredientsByRecipe.get(recipe.id) ?? [],
    })
  }

  const stale = isCatalogStockStale(
    db.getMeta("articles_last_hydrated_at") ??
      db.getMeta("recipe_bom_last_hydrated_at"),
  )

  return { stockByArticleId, recipes, stale }
}

export function availabilityForCatalogProduct(
  product: Pick<MenuCatalogProduct, "id" | "kind" | "promotionMeta">,
  ctx: CatalogAvailabilityContext,
): CatalogAvailability | null {
  if (product.kind === "article") {
    const stock = ctx.stockByArticleId.get(product.id)
    return stock ? projectArticleAvailability(stock, ctx.stale) : null
  }
  if (product.kind === "recipe") {
    return projectRecipeAvailability(
      ctx.recipes.get(product.id),
      ctx.stockByArticleId,
      ctx.stale,
    )
  }
  if (product.kind === "promotion" && product.promotionMeta) {
    return projectComboAvailability(
      product.promotionMeta.slots.map((slot) => ({
        quantity: slot.quantity,
        options: slot.options.map((option) => ({
          kind: option.kind,
          refId: option.refId,
        })),
      })),
      ctx.stockByArticleId,
      ctx.recipes,
      ctx.stale,
    )
  }
  return null
}

export function decorateMenuProductsAvailability(
  products: MenuCatalogProduct[],
  ctx: CatalogAvailabilityContext | null | undefined,
): MenuCatalogProduct[] {
  if (!ctx) return products
  return products.map((product) =>
    applyAvailabilityToProduct(
      product,
      availabilityForCatalogProduct(product, ctx),
    ),
  )
}
