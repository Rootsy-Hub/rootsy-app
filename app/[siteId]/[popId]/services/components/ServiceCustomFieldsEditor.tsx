"use client"

import {
  serviceDialogAddActionClass,
  serviceDialogPanelClass,
  serviceDialogRowPanelClass,
  serviceDialogSectionHintClass,
  serviceDialogSectionTitleClass,
} from "@/app/[siteId]/[popId]/services/serviceDialogShared"
import { RootsIconButton } from "@/components/rootsy-button"
import { RootsFormTextField, RootsFormTextareaField, rootsFormFieldHintClass } from "@/components/rootsy-form"
import { cn } from "@/lib/utils"
import { Plus, Trash2 } from "lucide-react"

type DetailRow = { label: string; value: string }
type ContractRow = { title: string; body: string }

type DetailEditorProps = {
  idPrefix: string
  title: string
  description: string
  addLabel: string
  labelPlaceholder: string
  valuePlaceholder: string
  valueMultiline?: boolean
  rows: DetailRow[]
  onChange: (rows: DetailRow[]) => void
  disabled?: boolean
}

function KeyValueEditor({
  idPrefix,
  title,
  description,
  addLabel,
  labelPlaceholder,
  valuePlaceholder,
  valueMultiline = false,
  rows,
  onChange,
  disabled = false,
}: DetailEditorProps) {
  const updateRow = (index: number, patch: Partial<DetailRow>) => {
    onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)))
  }

  const removeRow = (index: number) => {
    onChange(rows.filter((_, i) => i !== index))
  }

  const addRow = () => {
    onChange([...rows, { label: "", value: "" }])
  }

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h3 className={serviceDialogSectionTitleClass}>{title}</h3>
        <p className={serviceDialogSectionHintClass}>{description}</p>
      </div>

      <div className={serviceDialogPanelClass}>
        {rows.length === 0 ? (
          <p className={cn("text-sm", rootsFormFieldHintClass)}>Sin ítems cargados.</p>
        ) : (
          <div className="space-y-2">
            {rows.map((row, index) => (
              <div
                key={`${idPrefix}-${index}`}
                className={`${serviceDialogRowPanelClass} flex flex-wrap items-start gap-2`}
              >
                <div className="min-w-[10rem] flex-1">
                  <RootsFormTextField
                    label="Etiqueta"
                    id={`${idPrefix}-label-${index}`}
                    value={row.label}
                    onChange={(e) => updateRow(index, { label: e.target.value })}
                    placeholder={labelPlaceholder}
                    disabled={disabled}
                  />
                </div>
                <div className="min-w-[12rem] flex-[2]">
                  {valueMultiline ? (
                    <RootsFormTextareaField
                      label="Contenido"
                      id={`${idPrefix}-value-${index}`}
                      value={row.value}
                      onChange={(e) =>
                        updateRow(index, { value: e.target.value })
                      }
                      placeholder={valuePlaceholder}
                      disabled={disabled}
                      rows={3}
                    />
                  ) : (
                    <RootsFormTextField
                      label="Contenido"
                      id={`${idPrefix}-value-${index}`}
                      value={row.value}
                      onChange={(e) =>
                        updateRow(index, { value: e.target.value })
                      }
                      placeholder={valuePlaceholder}
                      disabled={disabled}
                    />
                  )}
                </div>
                <RootsIconButton
                  type="button"
                  label="Quitar"
                  tone="action"
                  intent="destructive"
                  size="compact"
                  className="mt-7 shrink-0"
                  disabled={disabled}
                  onClick={() => removeRow(index)}
                >
                  <Trash2 aria-hidden />
                </RootsIconButton>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          className={serviceDialogAddActionClass}
          disabled={disabled}
          onClick={addRow}
        >
          <Plus className="size-4" aria-hidden />
          {addLabel}
        </button>
      </div>
    </section>
  )
}

type Props = {
  idPrefix: string
  serviceDetails: DetailRow[]
  contractSections: ContractRow[]
  onServiceDetailsChange: (rows: DetailRow[]) => void
  onContractSectionsChange: (rows: ContractRow[]) => void
  disabled?: boolean
}

export function ServiceCustomFieldsEditor({
  idPrefix,
  serviceDetails,
  contractSections,
  onServiceDetailsChange,
  onContractSectionsChange,
  disabled = false,
}: Props) {
  return (
    <div className="flex flex-col gap-6">
      <KeyValueEditor
        idPrefix={`${idPrefix}-details`}
        title="Detalles del servicio"
        description="Campos libres para describir qué incluye el servicio (alcance, entregables, condiciones)."
        addLabel="Agregar detalle"
        labelPlaceholder="Ej. Sesiones incluidas"
        valuePlaceholder="Ej. 4 por mes"
        rows={serviceDetails}
        onChange={onServiceDetailsChange}
        disabled={disabled}
      />
      <KeyValueEditor
        idPrefix={`${idPrefix}-contract`}
        title="Contrato / plantilla"
        description="Secciones del acuerdo que se pueden reutilizar al dar de alta un servicio activo."
        addLabel="Agregar sección"
        labelPlaceholder="Ej. Objeto del servicio"
        valuePlaceholder="Texto de la cláusula o párrafo…"
        valueMultiline
        rows={contractSections.map((s) => ({
          label: s.title,
          value: s.body,
        }))}
        onChange={(rows) =>
          onContractSectionsChange(
            rows.map((row) => ({ title: row.label, body: row.value })),
          )
        }
        disabled={disabled}
      />
    </div>
  )
}
