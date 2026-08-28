"use client"

import dynamic from "next/dynamic"

const HandbookWorkspace = dynamic(
  () => import("@/app/handbook/HandbookWorkspace").then((module) => module.HandbookWorkspace),
  { ssr: false },
)

export function HandbookApp() {
  return <HandbookWorkspace />
}
