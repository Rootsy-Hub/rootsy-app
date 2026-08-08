import { RootsSpinner } from "@/components/rootsy-spinner"
import { cn } from "@/lib/utils"
import type { ComponentProps } from "react"

function Spinner({ className, ...props }: ComponentProps<typeof RootsSpinner>) {
  return <RootsSpinner size="sm" className={cn(className)} {...props} />
}

export { Spinner }
