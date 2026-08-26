import { HandbookNav } from "@/app/handbook/layoutHandbookShared"
import {
  libraryScrollDarkClass,
  librarySidebarClass,
} from "@/app/library/libraryColorTheme"
import { cn } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"

export function HandbookSidebar({
  activeSectionId,
}: {
  activeSectionId: string
}) {
  return (
    <aside
      className={cn(
        "hidden min-h-0 w-64 shrink-0 flex-col overflow-hidden border-r lg:flex",
        librarySidebarClass,
      )}
    >
      <div
        className={cn(
          "min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-4",
          libraryScrollDarkClass,
        )}
      >
        <Link
          href="/"
          aria-label="Rootsy — landing"
          className="mb-6 inline-flex px-2"
        >
          <Image
            src="/rootsy-logo.svg"
            alt="Rootsy"
            width={90}
            height={29}
            priority
            className="h-7 w-auto"
          />
        </Link>
        <HandbookNav activeSectionId={activeSectionId} />
      </div>
    </aside>
  )
}
