import type { MenuCatalogArticle, MenuCatalogRecipe } from "@/app/[siteId]/[popId]/menu-catalog/actions"
import type { MenuCatalogPromotion } from "@/app/[siteId]/[popId]/menu-catalog/actions"
import type { SaleCatalogProduct } from "@/components/sale-operation/saleCatalogProduct"
import type { MenuCartItemKind } from "@/lib/menuCart"

export type MenuCatalogProduct = SaleCatalogProduct & {
  kind: MenuCartItemKind
  section: "recipes" | "products" | "promotions"
  /** Clave de filtro sidebar: `recipes:{id}`, `products:{id}` o `promotions:all` */
  categoriaFiltro: string
  promotionMeta?: MenuCatalogPromotion
}

export function menuRecipeToProduct(recipe: MenuCatalogRecipe): MenuCatalogProduct {
  return {
    id: recipe.id,
    nombre: recipe.name,
    descripcion: recipe.description.trim() ? recipe.description : "—",
    precio: recipe.salePrice,
    categoria: recipe.categoryName.trim() ? recipe.categoryName : "—",
    imagen: recipe.imageUrl?.trim()
      ? recipe.imageUrl.trim()
      : `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(recipe.id)}&backgroundColor=1a1f1d`,
    kind: "recipe",
    section: "recipes",
    categoriaFiltro: `recipes:${recipe.categoryId}`,
  }
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
    imagen: `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(article.id)}&backgroundColor=1a1f1d`,
    kind: "article",
    section: "products",
    categoriaFiltro: `products:${article.categoryId}`,
  }
}
