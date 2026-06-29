import type { SaleCatalogArticle } from "@/app/[siteId]/[popId]/sale/actions"

export type SaleCatalogProduct = {
  id: string
  nombre: string
  descripcion: string
  precio: number
  precioOriginal?: number
  categoria: string
  imagen: string
  promo?: string
}

export function saleCatalogArticleToProduct(
  a: SaleCatalogArticle,
): SaleCatalogProduct {
  return {
    id: a.id,
    nombre: a.name,
    descripcion: a.description.trim() ? a.description : "—",
    precio: a.salePrice,
    precioOriginal: a.originalSalePrice,
    categoria: a.categoryName.trim() ? a.categoryName : "—",
    imagen: `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(a.id)}&backgroundColor=1a1f1d`,
  }
}
