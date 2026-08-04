"use client"

import { ARTICLE_TABLE_PAGE_SIZES } from "@/app/[siteId]/[popId]/articles/workspaceUrl"
import { articleTableArticleColumnClass, articleTableDetailColumnClass } from "@/app/[siteId]/[popId]/articles/articlesTableCells"
import { DataWorkspaceListPaginationFooter } from "@/components/data-workspace/DataWorkspaceListPaginationFooter"
import { DataWorkspaceListTableShell } from "@/components/data-workspace/DataWorkspaceListTableShell"
import { DataWorkspaceListTableFrame } from "@/components/data-workspace/DataWorkspaceListTablePrimitives"
import { workspaceTableLayoutClassName } from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  dataWorkspaceListFiltersBarClass,
  dataWorkspaceListFiltersBarInnerClass,
  dataWorkspaceListFiltersBarRowClass,
  dataWorkspaceListFiltersGridClass,
  dataWorkspaceListFiltersPanelClass,
  dataWorkspaceListFiltersPanelLastClass,
  workspaceTableLayoutHeaderHeadClass,
  workspaceTableLayoutImageColumnClass,
  workspaceTableLayoutListBodyScopeClass,
  workspaceTableLayoutListSurfaceClass,
  workspaceTableNatureEarthOrganicScopeClass,
} from "@/components/data-workspace/dataWorkspaceTablesLayout"
import {
  WorkspaceTableHead,
  WorkspaceTableHeader,
  WorkspaceTableHeaderRow,
} from "@/components/data-workspace/WorkspaceTableHeader"
import { WorkspaceTableSkeletonRows } from "@/components/data-workspace/WorkspaceTableSkeleton"
import { articlesSkeletonColumns } from "@/components/data-workspace/workspaceTableSkeletonPresets"
import { DataWorkspaceLayout } from "@/components/layouts/DataWorkspaceLayout"
import { DataWorkspaceHeaderIconButton } from "@/components/layouts/DataWorkspaceHeaderIconButton"
import { Skeleton } from "@/components/ui/skeleton"
import { TableBody } from "@/components/ui/table"
import { usePopWorkspaceOptional } from "@/context/PopWorkspaceContext"
import { cn } from "@/lib/utils"
import { FolderTree, Plus } from "lucide-react"
import { useParams } from "next/navigation"

const SKELETON_ROW_COUNT = 10

function FilterFieldSkeleton() {
  return (
    <div className="flex w-full min-w-0 flex-col gap-1.5">
      <Skeleton className="h-3 w-16 rounded-sm bg-muted-foreground/12" />
      <Skeleton className="h-11 w-full rounded-lg bg-muted-foreground/10" />
    </div>
  )
}

export function ArticlesPageSkeleton() {
  const params = useParams()
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : ""
  const bootstrap = usePopWorkspaceOptional()?.bootstrap

  if (!siteId || !popId) {
    return null
  }

  return (
    <DataWorkspaceLayout
      siteId={siteId}
      popId={popId}
      popName={bootstrap?.popName ?? ""}
      title="Stock"
      headerVariant="dark"
      contentFlush
      sidebarCollapsible={false}
      loading
      userName={bootstrap?.userFullName}
      userAvatarSrc={bootstrap?.userImageUrl ?? undefined}
      userRoleLabel={bootstrap?.roleLabel}
      pillLabel="Catálogo"
      mainClassName="rootsy-nature-palette min-h-0 overflow-hidden"
      headerActions={
        <>
          <DataWorkspaceHeaderIconButton
            label="Nuevo artículo"
            headerVariant="dark"
            primary
            disabled
          >
            <Plus className="size-5" aria-hidden />
          </DataWorkspaceHeaderIconButton>
          <DataWorkspaceHeaderIconButton
            label="Gestionar categorías"
            headerVariant="dark"
            disabled
          >
            <FolderTree className="size-5" aria-hidden />
          </DataWorkspaceHeaderIconButton>
        </>
      }
    >
      <div className="relative flex min-h-0 w-full flex-1 flex-col">
        <div className="relative flex min-h-0 flex-1 flex-col">
          <div
            className={dataWorkspaceListFiltersBarClass}
            role="toolbar"
            aria-label="Filtros del listado"
            aria-busy="true"
          >
            <div
              className={cn(
                dataWorkspaceListFiltersBarInnerClass,
                dataWorkspaceListFiltersBarRowClass,
              )}
            >
              <div className={dataWorkspaceListFiltersGridClass}>
                <div className={dataWorkspaceListFiltersPanelClass}>
                  <FilterFieldSkeleton />
                </div>
                <div className={dataWorkspaceListFiltersPanelClass}>
                  <FilterFieldSkeleton />
                </div>
                <div className={dataWorkspaceListFiltersPanelLastClass}>
                  <FilterFieldSkeleton />
                </div>
              </div>
            </div>
          </div>

          <DataWorkspaceListTableShell
            variant="flush"
            className={cn(
              workspaceTableNatureEarthOrganicScopeClass,
              workspaceTableLayoutListBodyScopeClass,
              workspaceTableLayoutListSurfaceClass,
            )}
            footer={
              <DataWorkspaceListPaginationFooter
                variant="dark"
                listFetching
                totalCount={0}
                rangeStart={0}
                rangeEnd={0}
                currentPage={1}
                totalPages={1}
                pageSize={25}
                pageSizeOptions={ARTICLE_TABLE_PAGE_SIZES}
                paginationItems={[1]}
                onPageChange={() => {}}
                onPageSizeChange={() => {}}
                pageSizeLabelId="articles-sk-page-size"
              />
            }
          >
            <DataWorkspaceListTableFrame className={workspaceTableLayoutListSurfaceClass}>
              <table
                className={cn(workspaceTableLayoutClassName, "min-w-[80rem]")}
                aria-busy="true"
              >
                <WorkspaceTableHeader>
                  <WorkspaceTableHeaderRow>
                    <WorkspaceTableHead
                      tone="nature"
                      className={cn("w-12", workspaceTableLayoutHeaderHeadClass)}
                      srOnly
                    >
                      Selección
                    </WorkspaceTableHead>
                    <WorkspaceTableHead
                      tone="nature"
                      className={cn(
                        workspaceTableLayoutImageColumnClass,
                        "px-3",
                        workspaceTableLayoutHeaderHeadClass,
                      )}
                      srOnly
                    >
                      Imagen
                    </WorkspaceTableHead>
                    <WorkspaceTableHead
                      tone="nature"
                      className={cn(
                        articleTableArticleColumnClass,
                        "px-3",
                        workspaceTableLayoutHeaderHeadClass,
                      )}
                    >
                      Artículo
                    </WorkspaceTableHead>
                    <WorkspaceTableHead
                      tone="nature"
                      className={cn(
                        articleTableDetailColumnClass,
                        "px-3",
                        workspaceTableLayoutHeaderHeadClass,
                      )}
                    >
                      Detalle
                    </WorkspaceTableHead>
                    <WorkspaceTableHead
                      tone="nature"
                      className={cn(
                        "w-40 px-3",
                        workspaceTableLayoutHeaderHeadClass,
                      )}
                    >
                      Categoría
                    </WorkspaceTableHead>
                    <WorkspaceTableHead
                      tone="nature"
                      align="right"
                      className={cn("w-28 px-3", workspaceTableLayoutHeaderHeadClass)}
                    >
                      Venta
                    </WorkspaceTableHead>
                    <WorkspaceTableHead
                      tone="nature"
                      align="right"
                      className={cn("w-28 px-3", workspaceTableLayoutHeaderHeadClass)}
                    >
                      Costo
                    </WorkspaceTableHead>
                    <WorkspaceTableHead
                      tone="nature"
                      align="right"
                      className={cn(
                        "w-[5.5rem] px-3",
                        workspaceTableLayoutHeaderHeadClass,
                      )}
                    >
                      Stock
                    </WorkspaceTableHead>
                  </WorkspaceTableHeaderRow>
                </WorkspaceTableHeader>
                <TableBody>
                  <WorkspaceTableSkeletonRows
                    rowCount={SKELETON_ROW_COUNT}
                    rowKeyPrefix="articles-route-sk"
                    columns={articlesSkeletonColumns()}
                    tone="nature"
                  />
                </TableBody>
              </table>
            </DataWorkspaceListTableFrame>
          </DataWorkspaceListTableShell>
        </div>
      </div>
      <span className="sr-only">Cargando stock…</span>
    </DataWorkspaceLayout>
  )
}
