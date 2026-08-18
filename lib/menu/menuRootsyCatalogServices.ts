import type { MenuRootsyCatalogSuggestion } from "@/lib/menu/menuRootsySuggestionCatalogTypes"

function s(
  profile: MenuRootsyCatalogSuggestion["profile"],
  index: number,
  entry: Omit<MenuRootsyCatalogSuggestion, "id" | "profile">,
): MenuRootsyCatalogSuggestion {
  return {
    id: `${profile}_${String(index).padStart(2, "0")}`,
    profile,
    ...entry,
  }
}

export const MENU_ROOTSY_CATALOG_SERVICES: MenuRootsyCatalogSuggestion[] = [
  s("services", 1, {
    teaser:
      "Recordá vencimientos antes que el cliente — eso genera confianza y renovación.",
    title: "Anticipar vencimientos",
    explanation:
      "Avisar con tiempo que un servicio vence permite renovar sin apuro. El cliente siente cuidado, no presión comercial.",
    dataKeys: [],
    requiredModules: ["active_services"],
    ctaModuleKeys: ["active_services", "services"],
  }),
  s("services", 2, {
    teaser:
      "Paquetes de sesiones venden más que una sola — el cliente se compromete.",
    title: "Vender paquetes",
    explanation:
      "Agrupar sesiones o meses en un paquete claro sube ticket y mejora continuidad. Explicá el beneficio en una frase.",
    dataKeys: ["avg_ticket"],
    requiredModules: ["active_services"],
    ctaModuleKeys: ["services", "active_services"],
  }),
  s("services", 3, {
    teaser:
      "Horarios de mayor demanda: abrí esos slots primero en la agenda.",
    title: "Agenda en hora pico",
    explanation:
      "Si todos piden el mismo turno, priorizá capacidad ahí. Es donde está la plata del servicio.",
    dataKeys: ["peak_hour"],
    requiredModules: ["active_services", "statistics"],
    ctaModuleKeys: ["statistics", "active_services"],
  }),
  s("services", 4, {
    teaser:
      "Servicios vencidos sin contacto — una llamada recupera ingresos.",
    title: "Recuperar vencidos",
    explanation:
      "Quien dejó vencer a veces solo necesita un recordatorio. Un contacto amable puede reactivarlo.",
    dataKeys: ["total_sales"],
    requiredModules: ["active_services"],
    ctaModuleKeys: ["active_services"],
  }),
  s("services", 5, {
    teaser:
      "Upsell a plan superior — mostrá la diferencia en valor, no solo precio.",
    title: "Subir de plan",
    explanation:
      "Explicar qué gana el cliente con el plan mayor (más sesiones, prioridad, extras) facilita la decisión.",
    dataKeys: ["avg_ticket"],
    requiredModules: ["services"],
    ctaModuleKeys: ["services"],
  }),
  s("services", 6, {
    teaser:
      "Valle en agenda: promo acotada en horas flojas llena huecos.",
    title: "Llenar huecos",
    explanation:
      "Turnos vacíos son costo fijo sin ingreso. Una promo en franja floja puede convertir ocio en venta.",
    dataKeys: ["slow_hour"],
    requiredModules: ["active_services", "promotions"],
    ctaModuleKeys: ["promotions", "active_services"],
  }),
  s("services", 7, {
    teaser:
      "Renovación automática con aviso — menos olvidos, más ingresos previsibles.",
    title: "Renovaciones claras",
    explanation:
      "Dejar claro cuándo y cómo se renueva evita sorpresas y bajas involuntarias. Transparencia retiene.",
    dataKeys: [],
    requiredModules: ["active_services"],
    ctaModuleKeys: ["active_services"],
  }),
  s("services", 8, {
    teaser:
      "Medí qué servicio deja más por hora — enfocá energía comercial ahí.",
    title: "Rentabilidad por hora",
    explanation:
      "No todos los servicios rinden igual por tiempo dedicado. Saber cuál conviene empujar orienta promos y agenda.",
    dataKeys: ["top_profit_product", "gross_margin"],
    requiredModules: ["services", "statistics"],
    ctaModuleKeys: ["statistics"],
  }),
  s("services", 9, {
    teaser:
      "Onboarding claro al alta — menos consultas, más retención.",
    title: "Primer día del cliente",
    explanation:
      "Explicar cómo reservar, pagar y qué incluye el servicio al inicio reduce fricción y reclamos.",
    dataKeys: [],
    requiredModules: ["services"],
    ctaModuleKeys: ["services"],
  }),
  s("services", 10, {
    teaser:
      "Referidos: un beneficio chico por traer amigo trae clientes baratos.",
    title: "Programa referidos",
    explanation:
      "Clientes contentos traen gente similar. Un incentivo simple por referido suele costar menos que publicidad.",
    dataKeys: ["total_sales"],
    requiredModules: ["services", "promotions"],
    ctaModuleKeys: ["promotions", "clients"],
  }),
  s("services", 11, {
    teaser:
      "Lista de espera en turnos completos — no perdés al que llega tarde.",
    title: "Lista de espera",
    explanation:
      "Si no hay lugar, anotar interesados recupera venta cuando se libera un turno.",
    dataKeys: [],
    requiredModules: ["active_services"],
    ctaModuleKeys: ["active_services"],
  }),
  s("services", 12, {
    teaser:
      "Comunicá cambios de precio con anticipación — evita mal clima.",
    title: "Cambios de precio",
    explanation:
      "Subidas súbitas sin aviso generan bajas. Un mensaje previo con razón clara (costos, mejora) suaviza.",
    dataKeys: [],
    requiredModules: ["services"],
    ctaModuleKeys: ["services"],
  }),
  s("services", 13, {
    teaser:
      "Compará mes a mes cuántos activos tenés — tendencia clara.",
    title: "Servicios activos",
    explanation:
      "La cantidad de clientes activos es pulso del negocio de servicios. Si baja, hay que actuar antes.",
    dataKeys: ["total_sales", "sales_delta"],
    requiredModules: ["active_services", "statistics"],
    ctaModuleKeys: ["statistics"],
  }),
  s("services", 14, {
    teaser:
      "Servicio estrella vs complemento — vendé el estrella primero.",
    title: "Estrella y complemento",
    explanation:
      "Identificar el servicio principal y los add-ons ordena la oferta comercial y simplifica venta.",
    dataKeys: ["top_volume_product"],
    requiredModules: ["services", "statistics"],
    ctaModuleKeys: ["statistics", "services"],
  }),
  s("services", 15, {
    teaser:
      "Recordatorios automáticos de turno — menos ausencias.",
    title: "Menos no-show",
    explanation:
      "Ausencias dejan huecos caros. SMS o aviso previo reduce inasistencias sin esfuerzo manual.",
    dataKeys: ["slow_hour"],
    requiredModules: ["active_services"],
    ctaModuleKeys: ["active_services"],
  }),
  s("services", 16, {
    teaser:
      "Cobrar al reservar cuando podés — compromiso real del cliente.",
    title: "Seña o prepago",
    explanation:
      "En servicios con demanda, seña o pago adelantado filtra curiosos y asegura ingreso.",
    dataKeys: [],
    requiredModules: ["active_services", "sale"],
    ctaModuleKeys: ["active_services", "sale"],
  }),
  s("services", 17, {
    teaser:
      "Revisá costos de insumos por servicio — margen real puede sorprender.",
    title: "Costo por servicio",
    explanation:
      "Tiempo más insumos definen margen. Lo que parece rentable a veces no lo es al detalle.",
    dataKeys: ["gross_margin"],
    requiredModules: ["services", "statistics"],
    ctaModuleKeys: ["statistics"],
  }),
  s("services", 18, {
    teaser:
      "Temporada alta: abrí más cupos con tiempo — no improvises.",
    title: "Preparar temporada",
    explanation:
      "Picos previsibles (enero, vuelta a clases) requieren agenda y personal listos antes.",
    dataKeys: ["peak_hour", "sales_delta"],
    requiredModules: ["active_services", "statistics"],
    ctaModuleKeys: ["statistics"],
  }),
  s("services", 19, {
    teaser:
      "Clientes inactivos 60 días — contacto personal para reactivar.",
    title: "Reactivar inactivos",
    explanation:
      "Quien no viene hace dos meses a veces solo necesita un empujón. Un mensaje personalizado funciona.",
    dataKeys: ["total_sales"],
    requiredModules: ["active_services", "clients"],
    ctaModuleKeys: ["clients", "active_services"],
  }),
  s("services", 20, {
    teaser:
      "Una meta simple por mes: más activos, más ticket o menos huecos.",
    title: "Foco mensual en servicios",
    explanation:
      "Elegir una palanca clara por mes en servicios permite medir y ajustar sin dispersión.",
    dataKeys: ["total_sales"],
    requiredModules: ["active_services"],
    ctaModuleKeys: ["statistics"],
  }),
]
