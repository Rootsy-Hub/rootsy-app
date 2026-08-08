import { parseMoneyInput } from "@/lib/moneyInput"

export type InvoiceComposeTab = "caja" | "homologacion"

export type InvoiceComposeFormState = {
  tab: InvoiceComposeTab
  importeTotal: string
  docTipo: string
  docNro: string
  receptorRazonSocial: string
  ptoVta: string
}

export function defaultInvoiceComposeFormState(): InvoiceComposeFormState {
  return {
    tab: "caja",
    importeTotal: "",
    docTipo: "99",
    docNro: "0",
    receptorRazonSocial: "Consumidor Final",
    ptoVta: "",
  }
}

export function invoiceComposeFormToFormData(
  form: InvoiceComposeFormState,
  files: { crt: File | null; key: File | null },
): FormData {
  const fd = new FormData()
  const parsedImporte = parseMoneyInput(form.importeTotal, Number.NaN)
  fd.set(
    "importeTotal",
    Number.isFinite(parsedImporte)
      ? String(parsedImporte)
      : form.importeTotal.trim(),
  )
  fd.set("docTipo", form.docTipo)
  fd.set("docNro", form.docNro)
  fd.set("receptorRazonSocial", form.receptorRazonSocial)
  if (form.tab === "homologacion") {
    fd.set("ptoVta", form.ptoVta)
    if (files.crt) fd.set("crt", files.crt)
    if (files.key) fd.set("key", files.key)
  }
  return fd
}
