import type { TreasuryAccountKind } from "@/lib/treasuryAccountKinds"

export type TreasuryAccountMenuActionId =
  | "add_pos"
  | "add_corporate_card"
  | "edit"
  | "deactivate"
  | "activate"
  | "delete"

export type TreasuryAccountMenuAction = {
  id: TreasuryAccountMenuActionId
  label: string
  variant?: "destructive"
  separatorBefore?: boolean
}

export function getTreasuryAccountMenuActions(
  kind: TreasuryAccountKind,
  permissions: {
    canCreate: boolean
    canUpdate: boolean
    canDelete: boolean
  },
  integrations?: {
    hasPos?: boolean
    hasCard?: boolean
  },
  account?: {
    isActive?: boolean
  },
): TreasuryAccountMenuAction[] {
  const actions: TreasuryAccountMenuAction[] = []
  const isActive = account?.isActive !== false

  if (permissions.canCreate && isActive) {
    if (kind === "bank" || kind === "wallet") {
      if (!integrations?.hasPos) {
        actions.push({
          id: "add_pos",
          label: "Agregar terminal POS",
        })
      }
      if (!integrations?.hasCard) {
        actions.push({
          id: "add_corporate_card",
          label: "Agregar tarjeta corporativa",
        })
      }
    }
  }

  if (permissions.canUpdate) {
    actions.push({
      id: "edit",
      label: "Editar",
      separatorBefore: actions.length > 0,
    })
    actions.push({
      id: isActive ? "deactivate" : "activate",
      label: isActive ? "Inactivar" : "Activar",
    })
  }

  if (permissions.canDelete) {
    actions.push({
      id: "delete",
      label: "Eliminar",
      variant: "destructive",
      separatorBefore: actions.length === 0 || !permissions.canUpdate,
    })
  }

  return actions
}

export function treasuryChildCreateDialogCopy(
  childKind: "pos" | "card_payable",
  parentName: string,
): {
  title: string
  description: string
  nameLabel: string
  namePlaceholder: string
  submitLabel: string
} {
  if (childKind === "pos") {
    return {
      title: "Agregar terminal POS",
      description: `Canal de cobros con tarjeta vinculado a ${parentName}. Los importes quedan a liquidar hasta acreditarse en la cuenta.`,
      nameLabel: "Nombre del terminal",
      namePlaceholder: "Ej. Posnet Galicia, Mercado Pago Point",
      submitLabel: "Agregar POS",
    }
  }
  return {
    title: "Agregar tarjeta corporativa",
    description: `Tarjeta de la empresa asociada a ${parentName}. El resumen queda registrado como pasivo a pagar.`,
    nameLabel: "Nombre de la tarjeta",
    namePlaceholder: "Ej. Visa corporativa Galicia",
    submitLabel: "Agregar tarjeta",
  }
}
