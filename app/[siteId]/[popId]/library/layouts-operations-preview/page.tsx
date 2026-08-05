"use client"

import { LayoutsOperationsBody } from "@/app/[siteId]/[popId]/library/layouts/LayoutsOperationsDocPrimitives"
import { LayoutsOperationsPreviewShell } from "@/app/[siteId]/[popId]/library/layouts/LayoutsOperationsPreviewShell"
import withAuth from "@/hoc/withAuth"

function LayoutsOperationsPreviewPage() {
  return (
    <LayoutsOperationsPreviewShell>
      <LayoutsOperationsBody composed />
    </LayoutsOperationsPreviewShell>
  )
}

export default withAuth(LayoutsOperationsPreviewPage)
