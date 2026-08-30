"use client"

import { layoutsOperarCheckoutPillsFromToolbox } from "@/components/layouts-module/LayoutsOperarCheckoutSteps"
import {
  buildSaleCheckoutModel,
  type SaleCheckoutModel,
} from "@/lib/saleCheckoutModel"

export function useSaleCheckoutModel(
  input: Parameters<typeof buildSaleCheckoutModel>[0],
): SaleCheckoutModel & {
  pills: ReturnType<typeof layoutsOperarCheckoutPillsFromToolbox>
} {
  const model = buildSaleCheckoutModel(input)
  return {
    ...model,
    pills: layoutsOperarCheckoutPillsFromToolbox({
      clienteLabel: model.toolbox.clienteLabel,
      clienteMeta: model.toolbox.clienteIvaLabel,
      clienteDisabled: model.toolbox.clienteDisabled,
      clienteConfigurado: model.toolbox.clienteConfigurado,
      toolbarDisabled: model.toolbox.toolbarDisabled,
      pagoDisabled: model.toolbox.pagoDisabled,
      comprobanteLabel: model.toolbox.comprobanteLabel,
      comprobanteConfigurado: model.toolbox.comprobanteConfigurado,
      pagoLabel: model.toolbox.pagoLabel,
      pagoMeta: model.toolbox.pagoSubLabel,
      pagoConfigurado: model.toolbox.pagoConfigurado,
      pagoIcon: model.toolbox.pagoIcon,
      onClienteClick: model.toolbox.onClienteClick,
      onComprobanteClick: model.toolbox.onComprobanteClick,
      onPagoClick: model.toolbox.onPagoClick,
    }),
  }
}
