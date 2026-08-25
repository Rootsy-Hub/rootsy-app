# POP Rootsy — bridge de cobros SaaS

Rootsy registra sus ingresos de plataforma (suscripciones SaaS) como **operaciones de servicios** en un POP interno dedicado, en paralelo al billing de plataforma existente (`_subscription_*`).

## Requisitos

1. **POP Rootsy** operativo (servicios, tesorería, plan contable).
2. Configuración del POP (una de dos):
   - **Uroboros → Bridge Rootsy:** elegir y guardar el POP Rootsy, o
   - Variable de entorno (fallback): `ROOTSY_POP_ID=<uuid>`

3. Al menos un **servicio de suscripción** cargado en ese POP (Administrar → Servicios).
4. **Bindings** en Uroboros → Bridge Rootsy: mapeo `plan + ciclo (+ rubro)` → `service_type_id`.

## Flujo (dual-write v1)

| Evento | Billing plataforma | POP Rootsy |
|--------|-------------------|------------|
| Alta trial | `start_pop_trial` | Sin cargo (hasta primer cobro) |
| Alta paid | `register_pop_subscription_payment` | `service_subscription` + `service_charge` + pago |
| Webhook MP | `register_pop_subscription_payment` (system) | Espejo vía `mirrorPlatformSubscriptionPayment` |
| Fin de trial (cron) | Idem webhook | Idem |

La idempotencia usa `_platform_operation_links.external_payment_id` (ID de pago Mercado Pago).

## Setup paso a paso

1. Aplicar migraciones `20260825180000_platform_rootsy_service_bridge.sql` y `20260825190000_platform_settings.sql`.
2. En `/backoffice/bridge-rootsy`, elegir y guardar el **POP Rootsy** (o setear `ROOTSY_POP_ID` como fallback).
3. En el POP Rootsy, crear servicios para cada plan/ciclo que se cobra.
4. En el mismo bridge, crear bindings eligiendo plan + ciclo + **servicio** (dropdown).
5. Probar un pago de prueba y verificar en **Operaciones → Servicios** del POP Rootsy.

## Código relevante

- `lib/rootsyPlatformPop.ts` — resolución POP Rootsy (DB → env fallback)
- `lib/rootsyTenantOperations/` — mirror, clientes org, operaciones
- `app/backoffice/bridge-rootsy/` — UI de bindings
- Hooks: `app/pops/create/actions.ts`, `lib/platformBilling/mercadopago/webhookHandler.ts`, `lib/platformBilling/jobs/processTrialBilling.ts`

## Fuera de alcance (v1)

- Landing leyendo `service_types` del POP (pendiente prototipos).
- Stats `services` en API.
- Seeds SQL de servicios en migraciones.

## Troubleshooting

| Síntoma | Causa probable |
|---------|----------------|
| Billing OK, sin operación en POP | Falta POP Rootsy (Uroboros o env) o binding |
| Log `Sin binding para plan X` | Crear binding en Bridge Rootsy |
| Signup OK, sin cliente en POP | Fail-open en dev; revisar logs `[rootsyTenantOperations]` |
| Cargo duplicado | No debería ocurrir; revisar `_platform_operation_links` |
