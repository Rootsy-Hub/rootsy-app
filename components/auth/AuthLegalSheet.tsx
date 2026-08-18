"use client"

import { RootsPrimaryButton } from "@/components/rootsy-button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  getLegalDocument,
  type LegalDocId,
} from "@/lib/legal/rootsyLegalDocuments"
import { cn } from "@/lib/utils"

type Props = {
  docId: LegalDocId | null
  onClose: () => void
}

export function AuthLegalSheet({ docId, onClose }: Props) {
  const isMobile = useIsMobile()
  const document = docId ? getLegalDocument(docId) : null

  return (
    <Sheet
      open={docId != null}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={cn(
          "rootsy-theme-landing gap-0 overflow-hidden border-[var(--color-border)] bg-[var(--color-elevated)] p-0 text-white shadow-[0_22px_70px_-18px_rgb(5_8_7/0.55)]",
          "[&>button]:text-[var(--rootsy-sombra-300)] [&>button]:hover:text-white [&>button]:focus-visible:ring-[var(--rootsy-savia-400)]",
          isMobile
            ? "inset-x-0 h-[88vh] max-h-[88vh] w-full rounded-t-2xl border-t sm:max-w-none"
            : "w-full border-l sm:max-w-xl",
        )}
      >
        {document ? (
          <>
            <SheetHeader className="shrink-0 space-y-1 border-b border-[var(--color-border)] px-6 py-5 pr-14 text-left">
              <SheetTitle className="text-xl font-semibold tracking-tight text-white">
                {document.title}
              </SheetTitle>
              <SheetDescription className="text-sm text-[var(--rootsy-sombra-300)]">
                {document.description} Actualizado el {document.updatedAt}.
              </SheetDescription>
            </SheetHeader>

            <div className="rootsy-scroll-minimal min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-6">
              <div className="space-y-7">
                {document.sections.map((section) => (
                  <section key={section.title} className="space-y-2.5">
                    <h3 className="text-sm font-semibold tracking-tight text-white">
                      {section.title}
                    </h3>
                    {section.paragraphs.map((paragraph, index) => (
                      <p
                        key={`${section.title}-${index}`}
                        className="text-sm leading-relaxed text-[var(--rootsy-sombra-300)]"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </section>
                ))}
              </div>
            </div>

            <SheetFooter className="shrink-0 border-t border-[var(--color-border)] px-6 py-4">
              <RootsPrimaryButton
                type="button"
                size="large"
                className="w-full"
                onClick={onClose}
              >
                Entendido
              </RootsPrimaryButton>
            </SheetFooter>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
