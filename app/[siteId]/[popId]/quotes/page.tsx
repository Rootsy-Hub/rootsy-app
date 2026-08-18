import { QuotesWorkspaceView } from "@/components/quotes/QuotesWorkspaceView"
import { PopListHydrationPage } from "@/lib/PopListHydrationPage"
import { prefetchPopQuotesTable } from "@/lib/prefetchPopListados"
import type { PopPageParams } from "@/lib/workspaceSearchParams"

export default async function QuotesPage({
  params,
}: {
  params: PopPageParams
}) {
  const { siteId, popId } = await params
  if (!siteId || !popId) {
    return (
      <div className="min-h-screen bg-background p-10 text-sm text-muted-foreground">
        Punto de venta no encontrado.
      </div>
    )
  }

  return (
    <PopListHydrationPage state={prefetchPopQuotesTable(popId)}>
      <QuotesWorkspaceView siteId={siteId} popId={popId} />
    </PopListHydrationPage>
  )
}
