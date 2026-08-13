"use client"

import { serviceDialogAddActionClass } from "@/app/[siteId]/[popId]/services/serviceDialogShared"
import {
  SERVICE_DETAILS_GRID_MAX_COLUMNS,
  SERVICE_DETAILS_GRID_MAX_ROWS,
  type ServiceDetailsGrid,
} from "@/lib/serviceCatalogTypes"
import { cn } from "@/lib/utils"
import { Columns3, Plus, Rows3, Trash2 } from "lucide-react"
import {
  useCallback,
  useMemo,
  useRef,
  type KeyboardEvent,
  type RefObject,
} from "react"

type Props = {
  idPrefix: string
  grid: ServiceDetailsGrid
  onChange: (grid: ServiceDetailsGrid) => void
  disabled?: boolean
}

type CellCoord = { row: number; col: number }

const STARTER_COLUMNS = 2
const STARTER_ROWS = 3

function columnLetter(index: number): string {
  return String.fromCharCode(65 + index)
}

function resizeRows(rows: string[][], colCount: number): string[][] {
  return rows.map((row) =>
    Array.from({ length: colCount }, (_, i) => String(row[i] ?? "")),
  )
}

function emptyRow(colCount: number): string[] {
  return Array.from({ length: colCount }, () => "")
}

function createStarterGrid(): ServiceDetailsGrid {
  return {
    columns: Array.from({ length: STARTER_COLUMNS }, () => ""),
    rows: Array.from({ length: STARTER_ROWS }, () => emptyRow(STARTER_COLUMNS)),
  }
}

function cellKey(row: number, col: number): string {
  return `${row}:${col}`
}

export function ServiceSpreadsheetEditor({
  idPrefix,
  grid,
  onChange,
  disabled = false,
}: Props) {
  const cellRefs = useRef<Map<string, HTMLInputElement>>(new Map())
  const colCount = grid.columns.length
  const canAddColumn = colCount < SERVICE_DETAILS_GRID_MAX_COLUMNS
  const canAddRow = grid.rows.length < SERVICE_DETAILS_GRID_MAX_ROWS

  const displayRows = useMemo(() => {
    if (colCount === 0) return []
    return resizeRows(grid.rows, colCount).slice(0, SERVICE_DETAILS_GRID_MAX_ROWS)
  }, [colCount, grid.rows])

  const registerCell = useCallback(
    (row: number, col: number, node: HTMLInputElement | null) => {
      const key = cellKey(row, col)
      if (node) cellRefs.current.set(key, node)
      else cellRefs.current.delete(key)
    },
    [],
  )

  const focusCell = useCallback((row: number, col: number) => {
    cellRefs.current.get(cellKey(row, col))?.focus()
  }, [])

  const setColumnName = (index: number, value: string) => {
    const columns = grid.columns.map((c, i) => (i === index ? value : c))
    onChange({ columns, rows: grid.rows })
  }

  const setCell = (rowIndex: number, colIndex: number, value: string) => {
    const rows = resizeRows(grid.rows, colCount)
    while (rows.length <= rowIndex) {
      rows.push(emptyRow(colCount))
    }
    rows[rowIndex] = rows[rowIndex]!.map((cell, ci) =>
      ci === colIndex ? value : cell,
    )
    onChange({
      columns: grid.columns,
      rows: rows.slice(0, SERVICE_DETAILS_GRID_MAX_ROWS),
    })
  }

  const startGrid = () => {
    if (disabled) return
    onChange(createStarterGrid())
  }

  const addColumn = () => {
    if (!canAddColumn || disabled) return
    const columns = [...grid.columns, ""]
    const rows =
      grid.rows.length > 0
        ? resizeRows(grid.rows, columns.length)
        : Array.from({ length: STARTER_ROWS }, () => emptyRow(columns.length))
    onChange({ columns, rows })
  }

  const removeColumn = (index: number) => {
    if (disabled) return
    const columns = grid.columns.filter((_, i) => i !== index)
    onChange({
      columns,
      rows: grid.rows.map((row) => row.filter((_, i) => i !== index)),
    })
  }

  const addRow = () => {
    if (!canAddRow || colCount === 0 || disabled) return
    onChange({
      columns: grid.columns,
      rows: [...grid.rows, emptyRow(colCount)],
    })
  }

  const removeRow = (rowIndex: number) => {
    if (disabled) return
    onChange({
      columns: grid.columns,
      rows: grid.rows.filter((_, i) => i !== rowIndex),
    })
  }

  const moveFocus = useCallback(
    (from: CellCoord, delta: { row?: number; col?: number }) => {
      const nextRow = Math.max(
        0,
        Math.min(displayRows.length - 1, from.row + (delta.row ?? 0)),
      )
      const nextCol = Math.max(
        0,
        Math.min(colCount - 1, from.col + (delta.col ?? 0)),
      )
      focusCell(nextRow, nextCol)
    },
    [colCount, displayRows.length, focusCell],
  )

  const handleCellKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
    coord: CellCoord,
  ) => {
    if (event.key === "Tab") {
      event.preventDefault()
      if (event.shiftKey) {
        if (coord.col > 0) moveFocus(coord, { col: -1 })
        else if (coord.row > 0) focusCell(coord.row - 1, colCount - 1)
      } else if (coord.col < colCount - 1) {
        moveFocus(coord, { col: 1 })
      } else if (coord.row < displayRows.length - 1) {
        focusCell(coord.row + 1, 0)
      }
      return
    }

    if (event.key === "Enter") {
      event.preventDefault()
      if (coord.row < displayRows.length - 1) moveFocus(coord, { row: 1 })
      return
    }

    if (event.key === "ArrowUp" && coord.row > 0) {
      event.preventDefault()
      moveFocus(coord, { row: -1 })
      return
    }
    if (event.key === "ArrowDown" && coord.row < displayRows.length - 1) {
      event.preventDefault()
      moveFocus(coord, { row: 1 })
      return
    }
    if (event.key === "ArrowLeft" && event.currentTarget.selectionStart === 0) {
      if (coord.col > 0) {
        event.preventDefault()
        moveFocus(coord, { col: -1 })
      }
      return
    }
    if (
      event.key === "ArrowRight" &&
      event.currentTarget.selectionStart === event.currentTarget.value.length
    ) {
      if (coord.col < colCount - 1) {
        event.preventDefault()
        moveFocus(coord, { col: 1 })
      }
    }
  }

  if (colCount === 0) {
    return (
      <button
        type="button"
        onClick={startGrid}
        disabled={disabled}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed",
          "border-[var(--rootsy-bruma-200)] bg-[var(--rootsy-bruma-50)] px-6 py-10",
          "text-sm text-[var(--rootsy-bruma-600)] transition-colors",
          "hover:border-[var(--rootsy-savia-400)] hover:bg-[color-mix(in_srgb,var(--rootsy-savia-500)_6%,white)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
      >
        <Columns3 className="size-8 text-[var(--rootsy-savia-600)]" aria-hidden />
        <span className="font-medium text-[var(--rootsy-bruma-800)]">Iniciar grilla</span>
      </button>
    )
  }

  const filledRows = grid.rows.filter((row) => row.some((cell) => cell.trim())).length

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-[var(--rootsy-bruma-500)]">
          {colCount} col · {filledRows} fila{filledRows === 1 ? "" : "s"} con datos
        </p>
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            className={serviceDialogAddActionClass}
            onClick={addColumn}
            disabled={disabled || !canAddColumn}
          >
            <Plus className="size-3.5" />
            Columna
          </button>
          <button
            type="button"
            className={serviceDialogAddActionClass}
            onClick={addRow}
            disabled={disabled || !canAddRow}
          >
            <Plus className="size-3.5" />
            Fila
          </button>
        </div>
      </div>

      <div
        className={cn(
          "overflow-hidden rounded-lg border border-[var(--rootsy-bruma-300)]",
          "bg-white shadow-[inset_0_1px_0_var(--rootsy-bruma-100)]",
        )}
      >
        <div className="rootsy-scroll-minimal max-h-[min(22rem,42vh)] overflow-auto">
          <table
            className="w-max min-w-full border-collapse text-sm"
            style={{ tableLayout: "fixed" }}
          >
            <thead className="sticky top-0 z-20">
              <tr>
                <th
                  className={cn(
                    "sticky left-0 z-30 w-11 min-w-11 border-b border-r border-[var(--rootsy-bruma-300)]",
                    "bg-[var(--rootsy-bruma-100)] px-1 py-1.5 text-center",
                  )}
                  aria-hidden
                />
                {grid.columns.map((_, colIndex) => (
                  <th
                    key={`letter-${colIndex}`}
                    className={cn(
                      "w-32 min-w-32 border-b border-r border-[var(--rootsy-bruma-300)]",
                      "bg-[var(--rootsy-bruma-100)] px-2 py-1 text-center",
                      "text-[11px] font-semibold tracking-wide text-[var(--rootsy-bruma-600)]",
                    )}
                  >
                    {columnLetter(colIndex)}
                  </th>
                ))}
              </tr>
              <tr>
                <th
                  className={cn(
                    "sticky left-0 z-30 w-11 min-w-11 border-b border-r border-[var(--rootsy-bruma-300)]",
                    "bg-[var(--rootsy-bruma-50)] px-1 py-0",
                  )}
                >
                  <Rows3
                    className="mx-auto size-3.5 text-[var(--rootsy-bruma-400)]"
                    aria-hidden
                  />
                </th>
                {grid.columns.map((column, colIndex) => (
                  <th
                    key={`header-${colIndex}`}
                    className={cn(
                      "border-b border-r border-[var(--rootsy-bruma-300)] bg-[var(--rootsy-bruma-50)] p-0",
                    )}
                  >
                    <div className="flex items-stretch">
                      <SpreadsheetHeaderInput
                        id={`${idPrefix}-col-${colIndex}`}
                        value={column}
                        onChange={(value) => setColumnName(colIndex, value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault()
                            focusCell(0, colIndex)
                          }
                        }}
                        disabled={disabled}
                        placeholder={`Columna ${colIndex + 1}`}
                        inputRef={undefined}
                      />
                      <button
                        type="button"
                        className={cn(
                          "shrink-0 border-l border-[var(--rootsy-bruma-200)] px-1.5",
                          "text-[var(--rootsy-bruma-400)] hover:bg-[var(--rootsy-bruma-100)] hover:text-[var(--rootsy-coral-600)]",
                          "disabled:opacity-40",
                        )}
                        onClick={() => removeColumn(colIndex)}
                        disabled={disabled || colCount <= 1}
                        aria-label={`Quitar columna ${columnLetter(colIndex)}`}
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayRows.map((row, rowIndex) => {
                const isPersistedRow = rowIndex < grid.rows.length
                const rowHasData = row.some((cell) => cell.trim())
                return (
                  <tr
                    key={`row-${rowIndex}`}
                    className={cn(
                      rowIndex % 2 === 1 && "bg-[color-mix(in_srgb,var(--rootsy-bruma-50)_60%,white)]",
                    )}
                  >
                    <td
                      className={cn(
                        "sticky left-0 z-10 w-11 min-w-11 border-b border-r border-[var(--rootsy-bruma-300)]",
                        "bg-[var(--rootsy-bruma-50)] px-1 py-0 text-center align-middle",
                        rowIndex % 2 === 1 &&
                          "bg-[color-mix(in_srgb,var(--rootsy-bruma-100)_70%,white)]",
                      )}
                    >
                      <div className="group/rownum flex items-center justify-center gap-0.5 py-1.5">
                        <span className="text-[11px] font-medium tabular-nums text-[var(--rootsy-bruma-500)]">
                          {rowIndex + 1}
                        </span>
                        {isPersistedRow && rowHasData ? (
                          <button
                            type="button"
                            className={cn(
                              "rounded p-0.5 text-[var(--rootsy-bruma-400)] opacity-0 transition-opacity",
                              "hover:text-[var(--rootsy-coral-600)] group-hover/rownum:opacity-100",
                              "disabled:opacity-40",
                            )}
                            onClick={() => removeRow(rowIndex)}
                            disabled={disabled}
                            aria-label={`Quitar fila ${rowIndex + 1}`}
                          >
                            <Trash2 className="size-3" />
                          </button>
                        ) : null}
                      </div>
                    </td>
                    {row.map((cell, colIndex) => (
                      <SpreadsheetCell
                        key={`cell-${rowIndex}-${colIndex}`}
                        id={`${idPrefix}-cell-${rowIndex}-${colIndex}`}
                        value={cell}
                        onChange={(value) => setCell(rowIndex, colIndex, value)}
                        onKeyDown={(event) => handleCellKeyDown(event, { row: rowIndex, col: colIndex })}
                        disabled={disabled}
                        inputRef={(node) => registerCell(rowIndex, colIndex, node)}
                      />
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function SpreadsheetHeaderInput({
  id,
  value,
  onChange,
  onKeyDown,
  disabled,
  placeholder,
  inputRef,
}: {
  id: string
  value: string
  onChange: (value: string) => void
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void
  disabled?: boolean
  placeholder?: string
  inputRef?: RefObject<HTMLInputElement | null>
}) {
  return (
    <input
      ref={inputRef}
      id={id}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      disabled={disabled}
      placeholder={placeholder}
      className={cn(
        "h-8 w-full min-w-0 border-0 bg-transparent px-2 text-xs font-semibold",
        "text-[var(--rootsy-bruma-800)] placeholder:font-normal placeholder:text-[var(--rootsy-bruma-400)]",
        "focus:bg-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--rootsy-savia-500)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
      )}
    />
  )
}

function SpreadsheetCell({
  id,
  value,
  onChange,
  onKeyDown,
  disabled,
  inputRef,
}: {
  id: string
  value: string
  onChange: (value: string) => void
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void
  disabled?: boolean
  inputRef: (node: HTMLInputElement | null) => void
}) {
  return (
    <td className="h-8 border-b border-r border-[var(--rootsy-bruma-300)] p-0 align-middle">
      <input
        ref={inputRef}
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        disabled={disabled}
        className={cn(
          "block h-8 w-full min-w-0 border-0 bg-transparent px-2 py-0 text-sm",
          "text-[var(--rootsy-bruma-900)] placeholder:text-[var(--rootsy-bruma-300)]",
          "focus:bg-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--rootsy-savia-500)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
      />
    </td>
  )
}
