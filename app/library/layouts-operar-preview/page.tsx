"use client"

import { LayoutsOperarFullPageDraft } from "@/app/library/layouts/LayoutsOperarDocPrimitives"
import { LayoutsOperarPreviewShell } from "@/app/library/layouts/LayoutsOperarPreviewShell"

export default function LayoutsOperarPreviewPage() {
  return (
    <LayoutsOperarPreviewShell>
      <LayoutsOperarFullPageDraft composed />
    </LayoutsOperarPreviewShell>
  )
}
