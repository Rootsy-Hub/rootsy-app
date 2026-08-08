import { formatMoneyInputForField, parseMoneyInput } from "@/lib/moneyInput"

export const MONEY_INT_MAX_DIGITS = 12

export type MoneyParts = {
  intDigits: string
  decDigits: string
}

export type MoneyEditZone = {
  zone: "integer" | "decimal"
  digitIndex: number
}

export type MoneyEditResult = {
  value: string
  selectionStart: number
  selectionEnd: number
}

const intDisplayFmt = new Intl.NumberFormat("es-AR", {
  maximumFractionDigits: 0,
})

function countDigitsBefore(str: string, pos: number): number {
  let count = 0
  for (let i = 0; i < pos && i < str.length; i++) {
    if (/\d/.test(str[i]!)) count++
  }
  return count
}

function positionAfterDigitCount(
  str: string,
  digitCount: number,
  from = 0,
  to = str.length,
): number {
  if (digitCount <= 0) return from
  let digits = 0
  for (let i = from; i < to; i++) {
    if (/\d/.test(str[i]!)) {
      digits++
      if (digits >= digitCount) return i + 1
    }
  }
  return to
}

function normalizeIntDigits(raw: string): string {
  const digits = raw.replace(/\D/g, "")
  if (!digits) return "0"
  const trimmed = digits.replace(/^0+(?=\d)/, "")
  return trimmed || "0"
}

export function parseMoneyDisplay(value: string): MoneyParts | null {
  const trimmed = value.trim()
  if (!trimmed) return null

  const commaIdx = trimmed.indexOf(",")
  if (commaIdx < 0) {
    return {
      intDigits: normalizeIntDigits(trimmed),
      decDigits: "00",
    }
  }

  return {
    intDigits: normalizeIntDigits(trimmed.slice(0, commaIdx)),
    decDigits: trimmed
      .slice(commaIdx + 1)
      .replace(/\D/g, "")
      .padEnd(2, "0")
      .slice(0, 2),
  }
}

export function formatMoneyParts(parts: MoneyParts | null): string {
  if (!parts) return ""
  const intNum = Number.parseInt(parts.intDigits || "0", 10)
  if (!Number.isFinite(intNum)) return ""
  const intFormatted = intDisplayFmt.format(intNum)
  const dec = parts.decDigits.padEnd(2, "0").slice(0, 2)
  return `${intFormatted},${dec}`
}

export function getMoneyEditZone(value: string, pos: number): MoneyEditZone {
  const commaIdx = value.indexOf(",")
  if (commaIdx < 0) {
    return { zone: "integer", digitIndex: countDigitsBefore(value, pos) }
  }
  if (pos <= commaIdx) {
    return {
      zone: "integer",
      digitIndex: countDigitsBefore(value.slice(0, commaIdx), pos),
    }
  }
  return {
    zone: "decimal",
    digitIndex: Math.min(
      countDigitsBefore(value.slice(commaIdx + 1), pos - commaIdx - 1),
      2,
    ),
  }
}

export function cursorFromMoneyZone(
  value: string,
  zone: MoneyEditZone["zone"],
  digitIndex: number,
): number {
  const commaIdx = value.indexOf(",")
  if (zone === "integer") {
    const end = commaIdx >= 0 ? commaIdx : value.length
    return positionAfterDigitCount(value, digitIndex, 0, end)
  }
  if (commaIdx < 0) return value.length
  if (digitIndex <= 0) return commaIdx + 1
  return positionAfterDigitCount(
    value,
    digitIndex,
    commaIdx + 1,
    value.length,
  )
}

function buildResult(parts: MoneyParts | null, zone: MoneyEditZone): MoneyEditResult {
  const value = formatMoneyParts(parts)
  const cursor = parts
    ? cursorFromMoneyZone(value, zone.zone, zone.digitIndex)
    : 0
  return { value, selectionStart: cursor, selectionEnd: cursor }
}

function insertInInteger(parts: MoneyParts, index: number, digit: string): MoneyParts {
  let intDigits = parts.intDigits
  if (intDigits === "0" && index === 0) {
    intDigits = digit
  } else {
    intDigits = normalizeIntDigits(
      intDigits.slice(0, index) + digit + intDigits.slice(index),
    )
  }
  if (intDigits.replace(/\D/g, "").length > MONEY_INT_MAX_DIGITS) {
    return parts
  }
  return { ...parts, intDigits }
}

function insertInDecimal(parts: MoneyParts, index: number, digit: string): MoneyParts {
  const dec = parts.decDigits.padEnd(2, "0").split("")
  const slot = Math.min(Math.max(index, 0), 1)
  dec[slot] = digit
  return { ...parts, decDigits: dec.join("") }
}

function backspaceInteger(parts: MoneyParts, index: number): MoneyParts | null {
  if (index <= 0) return parts
  let intDigits = parts.intDigits.slice(0, index - 1) + parts.intDigits.slice(index)
  intDigits = normalizeIntDigits(intDigits)
  if (intDigits === "0") return null
  return { ...parts, intDigits }
}

function backspaceDecimal(parts: MoneyParts, index: number): MoneyParts {
  const dec = parts.decDigits.padEnd(2, "0").split("")
  if (index >= 2) {
    dec[0] = dec[1] ?? "0"
    dec[1] = "0"
  } else if (index === 1) {
    dec[0] = "0"
    dec[1] = "0"
  }
  return { ...parts, decDigits: dec.join("") }
}

function deleteInteger(parts: MoneyParts, index: number): MoneyParts | null {
  if (index >= parts.intDigits.length) return parts
  let intDigits = parts.intDigits.slice(0, index) + parts.intDigits.slice(index + 1)
  intDigits = normalizeIntDigits(intDigits)
  if (intDigits === "0") return null
  return { ...parts, intDigits }
}

function deleteDecimal(parts: MoneyParts, index: number): MoneyParts {
  const dec = parts.decDigits.padEnd(2, "0").split("")
  if (index >= 2) return parts
  if (index === 0) {
    dec[0] = dec[1] ?? "0"
    dec[1] = "0"
  } else {
    dec[1] = "0"
  }
  return { ...parts, decDigits: dec.join("") }
}

function replaceSelectionWithDigit(
  value: string,
  start: number,
  end: number,
  digit: string,
): MoneyEditResult {
  if (start === 0 && end === value.length) {
    const parts = { intDigits: digit, decDigits: "00" }
    return buildResult(parts, { zone: "integer", digitIndex: 1 })
  }

  const before = value.slice(0, start)
  const after = value.slice(end)
  const merged = `${before}${digit}${after}`
  const parts = parseMoneyDisplay(merged)
  if (!parts) {
    return buildResult({ intDigits: digit, decDigits: "00" }, { zone: "integer", digitIndex: 1 })
  }

  const zone = getMoneyEditZone(value, start)
  const nextZone =
    zone.zone === "integer"
      ? { zone: "integer" as const, digitIndex: zone.digitIndex + 1 }
      : { zone: "decimal" as const, digitIndex: Math.min(zone.digitIndex + 1, 2) }

  return buildResult(parts, nextZone)
}

export function applyMoneyDigitInput(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  digit: string,
): MoneyEditResult {
  if (!/^\d$/.test(digit)) {
    return {
      value,
      selectionStart,
      selectionEnd,
    }
  }

  if (selectionStart !== selectionEnd) {
    return replaceSelectionWithDigit(value, selectionStart, selectionEnd, digit)
  }

  if (!value.trim()) {
    return buildResult({ intDigits: digit, decDigits: "00" }, { zone: "integer", digitIndex: 1 })
  }

  const parts = parseMoneyDisplay(value)
  if (!parts) {
    return buildResult({ intDigits: digit, decDigits: "00" }, { zone: "integer", digitIndex: 1 })
  }

  const zone = getMoneyEditZone(value, selectionStart)
  if (zone.zone === "integer") {
    const next = insertInInteger(parts, zone.digitIndex, digit)
    return buildResult(next, {
      zone: "integer",
      digitIndex: zone.digitIndex + 1,
    })
  }

  const next = insertInDecimal(parts, zone.digitIndex, digit)
  return buildResult(next, {
    zone: "decimal",
    digitIndex: Math.min(zone.digitIndex + 1, 2),
  })
}

export function applyMoneyBackspace(
  value: string,
  selectionStart: number,
  selectionEnd: number,
): MoneyEditResult {
  if (!value.trim()) {
    return { value: "", selectionStart: 0, selectionEnd: 0 }
  }

  if (selectionStart !== selectionEnd) {
    const nextValue = value.slice(0, selectionStart) + value.slice(selectionEnd)
    const parts = parseMoneyDisplay(nextValue)
    const zone = getMoneyEditZone(value, selectionStart)
    return buildResult(parts, zone)
  }

  if (selectionStart === 0) {
    return { value, selectionStart: 0, selectionEnd: 0 }
  }

  const parts = parseMoneyDisplay(value)
  if (!parts) return { value: "", selectionStart: 0, selectionEnd: 0 }

  const zone = getMoneyEditZone(value, selectionStart)
  if (zone.zone === "integer") {
    const next = backspaceInteger(parts, zone.digitIndex)
    return buildResult(next, {
      zone: "integer",
      digitIndex: Math.max(zone.digitIndex - 1, 0),
    })
  }

  if (zone.digitIndex === 0) {
    const cursor = cursorFromMoneyZone(value, "integer", parts.intDigits.length)
    return { value, selectionStart: cursor, selectionEnd: cursor }
  }

  const next = backspaceDecimal(parts, zone.digitIndex)
  return buildResult(next, {
    zone: "decimal",
    digitIndex: Math.max(zone.digitIndex - 1, 0),
  })
}

export function applyMoneyDelete(
  value: string,
  selectionStart: number,
  selectionEnd: number,
): MoneyEditResult {
  if (!value.trim()) {
    return { value: "", selectionStart: 0, selectionEnd: 0 }
  }

  if (selectionStart !== selectionEnd) {
    return applyMoneyBackspace(value, selectionStart, selectionEnd)
  }

  const parts = parseMoneyDisplay(value)
  if (!parts) return { value: "", selectionStart: 0, selectionEnd: 0 }

  const zone = getMoneyEditZone(value, selectionStart)
  if (zone.zone === "integer") {
    const next = deleteInteger(parts, zone.digitIndex)
    return buildResult(next, zone)
  }

  const next = deleteDecimal(parts, zone.digitIndex)
  return buildResult(next, zone)
}

export function applyMoneyPaste(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  pasted: string,
): MoneyEditResult {
  const merged = value.slice(0, selectionStart) + pasted + value.slice(selectionEnd)
  const parsed = parseMoneyInput(merged, Number.NaN)
  if (!Number.isFinite(parsed)) {
    return { value, selectionStart, selectionEnd }
  }
  const formatted = formatMoneyInputForField(parsed)
  const cursor = formatted.length
  return { value: formatted, selectionStart: cursor, selectionEnd: cursor }
}

export function applyMoneyDecimalJump(value: string): MoneyEditResult {
  if (!value.includes(",")) {
    return { value, selectionStart: value.length, selectionEnd: value.length }
  }
  const commaIdx = value.indexOf(",")
  const cursor = commaIdx + 1
  return { value, selectionStart: cursor, selectionEnd: cursor }
}
