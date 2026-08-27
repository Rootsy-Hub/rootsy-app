export { PopLocalDatabase, applyPopLocalSchema } from "@/lib/popLocalDb/database"
export { createPopLocalDatabase, loadSqlEngine } from "@/lib/popLocalDb/engine"
export {
  getOpenedPopLocalDb,
  openPopLocalDb,
  peekPopLocalDb,
} from "@/lib/popLocalDb/store"
export {
  countLocalArticles,
  deleteArticleById,
  deleteMerchandiseNotIn,
  deleteMerchandiseNotInCategory,
  findSaleBoardArticleByScan,
  getArticleById,
  listSaleBoardArticles,
  renameArticlesCategory,
  replaceMerchandiseArticles,
  upsertArticleSnapshots,
} from "@/lib/popLocalDb/articlesRepo"
export {
  loadRealtimeLastSeq,
  persistRealtimeLastSeq,
  parseRealtimeLastSeq,
  nextPersistedRealtimeSeq,
  REALTIME_LAST_SEQ_META,
  readSessionRealtimeLastSeq,
  writeSessionRealtimeLastSeq,
} from "@/lib/popLocalDb/realtimeSeq"
export {
  clearPopLocalArticlesHydrateMarks,
  fetchSaleBoardMerchandisePages,
  hydratePopArticlesFromNetwork,
  popLocalArticlesHydrateInput,
  POP_LOCAL_ARTICLES_PAGE_SIZE,
} from "@/lib/popLocalDb/hydrateArticles"
export {
  clearPopLocalCategoriesHydrateMark,
  hydratePopCategoriesFromNetwork,
} from "@/lib/popLocalDb/hydrateCategories"
export {
  clearPopLocalPromotionsHydrateMark,
  fetchSaleBoardPromotionPages,
  hydratePopPromotionsFromNetwork,
  popLocalPromotionsHydrateInput,
  POP_LOCAL_PROMOTIONS_PAGE_SIZE,
} from "@/lib/popLocalDb/hydratePromotions"
export {
  deleteCategoryById,
  getCategoryById,
  listAllCategories,
  listSaleBoardCategories,
  replaceAllCategories,
  upsertCategorySnapshots,
} from "@/lib/popLocalDb/categoriesRepo"
export {
  deletePromotionById,
  deletePromotionsNotIn,
  listAllPromotions,
  upsertPromotionSnapshots,
} from "@/lib/popLocalDb/promotionsRepo"
export {
  articleListItemToSnapshot,
  articleSnapshotBindValues,
  sqlArticleRowToSnapshot,
} from "@/lib/popLocalDb/mapArticle"
export {
  categorySnapshotToOption,
  dtoToCategorySnapshot,
} from "@/lib/popLocalDb/mapCategory"
export {
  listSaleCart,
  replaceSaleCart,
} from "@/lib/popLocalDb/saleCartRepo"
export type { SaleCartSnapshot } from "@/lib/popLocalDb/saleCartRepo"
export {
  promotionDumpRowToSnapshot,
  promotionSnapshotToMenuCatalog,
  splitLocalPromotionsForSale,
} from "@/lib/popLocalDb/mapPromotion"
export type {
  ArticleSnapshot,
  CategorySnapshot,
  ListSaleBoardArticlesInput,
  ListSaleBoardArticlesResult,
  PromotionSnapshot,
} from "@/lib/popLocalDb/types"
