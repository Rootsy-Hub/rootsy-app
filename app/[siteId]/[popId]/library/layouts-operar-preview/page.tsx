"use client"

import { LayoutsOperarFullPageDraft } from "@/app/[siteId]/[popId]/library/layouts/LayoutsOperarDocPrimitives"
import { LayoutsOperarPreviewShell } from "@/app/[siteId]/[popId]/library/layouts/LayoutsOperarPreviewShell"
import withAuth from "@/hoc/withAuth"

function LayoutsOperarPreviewPage() {
  return (
    <LayoutsOperarPreviewShell>
      <LayoutsOperarFullPageDraft composed />
    </LayoutsOperarPreviewShell>
  )
}

export default withAuth(LayoutsOperarPreviewPage)
