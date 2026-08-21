import type { MenuCatalogArticle, MenuCatalogRecipe } from "@/app/[siteId]/[popId]/menu-catalog/actions"
import type { MenuCatalogPromotion } from "@/app/[siteId]/[popId]/menu-catalog/actions"
import type { SaleCatalogProduct } from "@/components/sale-operation/saleCatalogProduct"
import {
  normalizeCartItemKind,
  type MenuCartItem,
  type MenuCartItemKind,
  type MenuCartItemSnapshot,
} from "@/lib/menuCart"

export type MenuCatalogProduct = SaleCatalogProduct & {
  kind: MenuCartItemKind
  section: "recipes" | "products" | "promotions"
  /** Clave de filtro sidebar: `recipes:{id}`, `products:{id}` o `promotions:all` */
  categoriaFiltro: string
  promotionMeta?: MenuCatalogPromotion
}

export function catalogProductPlaceholderImage(id: string): string {
  return `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(id)}&backgroundColor=1a1f1d`
}

export function resolveCatalogProductImage(
  id: string,
  imageUrl: string | null | undefined,
): string {
  const trimmed = typeof imageUrl === "string" ? imageUrl.trim() : ""
  return trimmed || catalogProductPlaceholderImage(id)
}

export function menuRecipeToProduct(recipe: MenuCatalogRecipe): MenuCatalogProduct {
  return {
    id: recipe.id,
    nombre: recipe.name,
    descripcion: recipe.description.trim() ? recipe.description : "—",
    precio: recipe.salePrice,
    categoria: recipe.categoryName.trim() ? recipe.categoryName : "—",
    imagen: resolveCatalogProductImage(recipe.id, recipe.imageUrl),
    kind: "recipe",
    section: "recipes",
    categoriaFiltro: `recipes:${recipe.categoryId}`,
    iva: recipe.iva,
  }
}

export function snapshotFromCatalogProduct(
  product: MenuCatalogProduct,
): MenuCartItemSnapshot {
  return {
    nombre: product.nombre,
    precio: product.precio,
    ...(product.precioOriginal != null
      ? { precioOriginal: product.precioOriginal }
      : {}),
    ...(product.imagen ? { imagen: product.imagen } : {}),
    ...(product.descripcion ? { descripcion: product.descripcion } : {}),
    ...(product.iva != null ? { iva: product.iva } : {}),
    ...(product.categoria ? { categoria: product.categoria } : {}),
  }
}

export function catalogProductFromCartSnapshot(
  item: Pick<MenuCartItem, "productoId" | "kind" | "snapshot">,
): MenuCatalogProduct | null {
  const snapshot = item.snapshot
  if (!snapshot?.nombre.trim()) return null
  const kind = normalizeCartItemKind(item.kind)
  return {
    id: item.productoId,
    nombre: snapshot.nombre,
    descripcion: snapshot.descripcion?.trim() ? snapshot.descripcion : "—",
    precio: snapshot.precio,
    ...(snapshot.precioOriginal != null
      ? { precioOriginal: snapshot.precioOriginal }
      : {}),
    categoria: snapshot.categoria?.trim() ? snapshot.categoria : "—",
    imagen: resolveCatalogProductImage(item.productoId, snapshot.imagen),
    kind,
    section:
      kind === "recipe"
        ? "recipes"
        : kind === "promotion"
          ? "promotions"
          : "products",
    categoriaFiltro:
      kind === "recipe"
        ? "recipes:all"
        : kind === "promotion"
          ? "promotions:all"
          : "products:all",
    ...(snapshot.iva != null ? { iva: snapshot.iva } : {}),
  }
}

export function resolveMenuCartCatalogProduct(
  productosByKey: Map<string, MenuCatalogProduct>,
  productoId: string,
  kind: MenuCartItemKind,
  snapshot?: MenuCartItemSnapshot,
): MenuCatalogProduct | null {
  return (
    productosByKey.get(`${kind}:${productoId}`) ??
    productosByKey.get(`recipe:${productoId}`) ??
    productosByKey.get(`article:${productoId}`) ??
    productosByKey.get(`promotion:${productoId}`) ??
    catalogProductFromCartSnapshot({ productoId, kind, snapshot })
  )
}

export function collectCartCatalogEnsureIds(
  items: Array<{ productoId: string; kind?: MenuCartItemKind }>,
): { articleIds: string[]; recipeIds: string[] } {
  const articleIds: string[] = []
  const recipeIds: string[] = []
  for (const item of items) {
    const kind = normalizeCartItemKind(item.kind)
    if (kind === "promotion" || !item.productoId) continue
    articleIds.push(item.productoId)
    recipeIds.push(item.productoId)
  }
  return { articleIds, recipeIds }
}

export function menuArticleToProduct(article: MenuCatalogArticle): MenuCatalogProduct {
  return {
    id: article.id,
    nombre: article.name,
    descripcion: article.description.trim() ? article.description : "—",
    precio: article.salePrice,
    precioOriginal: article.originalSalePrice,
    discountMode: article.discountMode,
    discountValue: article.discountValue,
    categoria: article.categoryName.trim() ? article.categoryName : "—",
    imagen: resolveCatalogProductImage(article.id, article.imageUrl),
    kind: "article",
    section: "products",
    categoriaFiltro: `products:${article.categoryId}`,
    unitOfMeasure: article.unitOfMeasure,
    iva: article.iva,
    barcode: article.barcode ?? null,
  }
}
