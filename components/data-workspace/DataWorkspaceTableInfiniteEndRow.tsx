"use client"

import {
  dataWorkspaceTableInfiniteEndCopy,
  type DataWorkspaceTableInfiniteWorld,
} from "@/components/data-workspace/dataWorkspaceTableInfiniteCopy"

export function DataWorkspaceTableInfiniteEndRow({
  world,
  colSpan,
  loadedCount,
  totalCount,
}: {
  world: DataWorkspaceTableInfiniteWorld
  colSpan: number
  loadedCount: number
  totalCount: number
}) {
  if (totalCount <= 0 || loadedCount !== totalCount) return null

  return (
    <tr data-table-end="">
      <td
        colSpan={colSpan}
        role="status"
        className="bg-[var(--rootsy-bruma-50)] px-6 py-8 text-center font-canopy text-sm font-medium leading-relaxed whitespace-normal text-[var(--rootsy-bruma-700)]"
      >
        {dataWorkspaceTableInfiniteEndCopy(world)}
      </td>
    </tr>
  )
}
