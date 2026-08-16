"use client"

import { SaleCatalogToolbar } from "@/components/sale-operation/SaleCatalogToolbar"
import { cn } from "@/lib/utils"
import type { ComponentProps } from "react"

type SaleToolbarProps = ComponentProps<typeof SaleCatalogToolbar>

type Props = {
  modoVista: SaleToolbarProps["modoVista"]
  onModoVistaChange: SaleToolbarProps["onModoVistaChange"]
  busqueda: SaleToolbarProps["busqueda"]
  onBusquedaChange: SaleToolbarProps["onBusquedaChange"]
  cantidadIngreso: SaleToolbarProps["cantidadIngreso"]
  onCantidadIngresoChange: SaleToolbarProps["onCantidadIngresoChange"]
  resultCount: number
  className?: string
}

export function PurchaseCatalogToolbar({
  modoVista,
  onModoVistaChange,
  busqueda,
  onBusquedaChange,
  cantidadIngreso,
  onCantidadIngresoChange,
  resultCount,
  className,
}: Props) {
  return (
    <SaleCatalogToolbar
      variant="operar"
      showPriceList={false}
      modoVista={modoVista}
      onModoVistaChange={onModoVistaChange}
      busqueda={busqueda}
      onBusquedaChange={onBusquedaChange}
      cantidadIngreso={cantidadIngreso}
      onCantidadIngresoChange={onCantidadIngresoChange}
      searchPlaceholder="Buscar artículo..."
      trailing={
        <span className="text-sm font-medium text-[color-mix(in_srgb,var(--rootsy-sombra-300)_72%,transparent)]">
          {resultCount} artículos
        </span>
      }
      className={cn(className)}
    />
  )
}
