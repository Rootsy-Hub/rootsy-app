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
  hydratePopArticlesFromNetwork,
  popLocalArticlesHydrateInput,
  POP_LOCAL_ARTICLES_PAGE_SIZE,
} from "@/lib/popLocalDb/hydrateArticles"
export {
  clearPopLocalCategoriesHydrateMark,
  hydratePopCategoriesFromNetwork,
} from "@/lib/popLocalDb/hydrateCategories"
export {
  deleteCategoryById,
  getCategoryById,
  listAllCategories,
  listSaleBoardCategories,
  replaceAllCategories,
  upsertCategorySnapshots,
} from "@/lib/popLocalDb/categoriesRepo"
export {
  articleListItemToSnapshot,
  articleSnapshotBindValues,
  sqlArticleRowToSnapshot,
} from "@/lib/popLocalDb/mapArticle"
export {
  categorySnapshotToOption,
  dtoToCategorySnapshot,
} from "@/lib/popLocalDb/mapCategory"
export type {
  ArticleSnapshot,
  CategorySnapshot,
  ListSaleBoardArticlesInput,
  ListSaleBoardArticlesResult,
} from "@/lib/popLocalDb/types"
