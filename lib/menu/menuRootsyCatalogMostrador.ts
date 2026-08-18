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

export const MENU_ROOTSY_CATALOG_MOSTRADOR: MenuRootsyCatalogSuggestion[] = [
  s("mostrador", 1, {
    teaser:
      "Mostrá primero lo que querés vender — ojo va a donde hay luz y orden.",
    title: "Frente de mostrador",
    explanation:
      "Lo que está a la altura de los ojos y bien presentado se vende más. Rotá lo estacional al frente y dejá lo de margen bajo un poco más atrás si podés.",
    dataKeys: ["top_volume_product", "top_profit_product"],
    requiredModules: ["mostrador"],
    ctaModuleKeys: ["mostrador", "statistics"],
  }),
  s("mostrador", 2, {
    teaser:
      "Marcas conocidas marcan precio en la cabeza del cliente — usalas con criterio.",
    title: "Marcas que marcan precio",
    explanation:
      "Hay productos de marca que la gente usa para decidir si un local es caro o barato. Conviene saber cuáles son en tu rubro y no pelear precio ahí sin estrategia.",
    dataKeys: ["top_volume_product"],
    requiredModules: ["mostrador"],
    ctaModuleKeys: ["mostrador", "statistics"],
  }),
  s("mostrador", 3, {
    teaser:
      "Un combo armado en mostrador vende más que dos productos sueltos.",
    title: "Combos en mostrador",
    explanation:
      "Armar paquetes claros (café + medialuna, sandwich + bebida) simplifica la elección y sube ticket. El cliente siente que gana tiempo.",
    dataKeys: ["avg_ticket"],
    requiredModules: ["mostrador"],
    ctaModuleKeys: ["mostrador", "promotions"],
  }),
  s("mostrador", 4, {
    teaser:
      "Etiquetá bien precios y nombres — la duda frena la compra.",
    title: "Precios visibles",
    explanation:
      "Si el cliente tiene que preguntar todo, la fila se frena. Etiquetas legibles y precios claros aceleran y transmiten orden.",
    dataKeys: [],
    requiredModules: ["mostrador"],
    ctaModuleKeys: ["mostrador"],
  }),
  s("mostrador", 5, {
    teaser:
      "En hora floja, probá una promo chica solo en mostrador — levanta sin tocar el pico.",
    title: "Promo en horas flojas",
    explanation:
      "Cuando el movimiento baja, una oferta acotada en mostrador puede traer gente que ya está cerca. Mejor en el valle que regalar margen en el rush.",
    dataKeys: ["slow_hour", "peak_hour"],
    requiredModules: ["mostrador", "promotions"],
    ctaModuleKeys: ["promotions", "statistics"],
  }),
  s("mostrador", 6, {
    teaser:
      "Lo más rentable no siempre es lo más vendido — dale más espacio en vitrina.",
    title: "Empujar lo rentable",
    explanation:
      "A veces el producto que más deja está escondido. Subilo de lugar en mostrador o mencionarlo como recomendación del día.",
    dataKeys: ["top_profit_product", "top_volume_product"],
    requiredModules: ["mostrador", "statistics"],
    ctaModuleKeys: ["statistics", "mostrador"],
  }),
  s("mostrador", 7, {
    teaser:
      "Muestras pequeñas o ver el producto armado — ayuda a decidir.",
    title: "Ver para creer",
    explanation:
      "Un corte, una porción de muestra o ver el producto terminado reduce la duda. En mostrador, lo visual cierra ventas.",
    dataKeys: [],
    requiredModules: ["mostrador"],
    ctaModuleKeys: ["mostrador"],
  }),
  s("mostrador", 8, {
    teaser:
      "Menos opciones abiertas en pico = fila más rápida y menos errores.",
    title: "Carta acotada en pico",
    explanation:
      "En el rush, una carta corta o un menú del día operativo evita cuellos de botella. Podés volver al catálogo completo en horas tranquilas.",
    dataKeys: ["peak_hour"],
    requiredModules: ["mostrador"],
    ctaModuleKeys: ["mostrador"],
  }),
  s("mostrador", 9, {
    teaser:
      "Recosteo cada tanto — lo que ayer rendía hoy a veces ya no.",
    title: "Revisar costos",
    explanation:
      "Precios de insumos cambian. Si no actualizás fichas o márgenes, podés estar empujando lo que menos deja sin saberlo.",
    dataKeys: ["gross_margin"],
    requiredModules: ["mostrador", "statistics"],
    ctaModuleKeys: ["statistics", "recipes"],
  }),
  s("mostrador", 10, {
    teaser:
      "Productos de impulso cerca de la caja — se van de regalo al cobrar.",
    title: "Impulso en caja",
    explanation:
      "Chocolates, bebidas chicas o snacks junto al cobro aprovechan la última decisión. Es la zona más rentable del mostrador.",
    dataKeys: ["avg_ticket"],
    requiredModules: ["mostrador"],
    ctaModuleKeys: ["mostrador"],
  }),
  s("mostrador", 11, {
    teaser:
      "Rotá lo de estación — lo mismo todo el año cansa la vitrina.",
    title: "Estacionalidad",
    explanation:
      "Cambiar protagonistas según estación mantiene interés. No hace falta catálogo nuevo: alcanza con destacar distinto.",
    dataKeys: [],
    requiredModules: ["mostrador"],
    ctaModuleKeys: ["mostrador"],
  }),
  s("mostrador", 12, {
    teaser:
      "Si hay delivery, separá tiempos mostrador vs envío — no mezcles colas.",
    title: "Mostrador vs delivery",
    explanation:
      "Mezclar pedidos de mostrador con apps en el mismo flujo genera demoras. Flujos separados protegen la experiencia presencial.",
    dataKeys: ["peak_hour"],
    requiredModules: ["mostrador"],
    ctaModuleKeys: ["mostrador"],
  }),
  s("mostrador", 13, {
    teaser:
      "Capacitá una frase de upsell por producto estrella — todos la usan.",
    title: "Frase de upsell",
    explanation:
      "Una sola pregunta entrenada (“¿Le agrego…?”) alineada al producto estrella sube ticket sin improvisar en cada venta.",
    dataKeys: ["avg_ticket", "top_volume_product"],
    requiredModules: ["mostrador"],
    ctaModuleKeys: ["mostrador"],
  }),
  s("mostrador", 14, {
    teaser:
      "Controlá merma visible — lo que vence en vitrina se come margen.",
    title: "Merma en vitrina",
    explanation:
      "Pan, frescos y armados en mostrador tienen fecha corta. Rotación diaria y porciones acordes al movimiento evitan tirar producto.",
    dataKeys: ["gross_margin"],
    requiredModules: ["mostrador", "statistics"],
    ctaModuleKeys: ["statistics", "stock"],
  }),
  s("mostrador", 15, {
    teaser:
      "Compará ticket promedio semana a semana — una referencia simple alcanza.",
    title: "Ticket de referencia",
    explanation:
      "Saber si cada venta rinde más o menos que la semana pasada orienta sin ser experto. Es una sola cifra muy clara.",
    dataKeys: ["avg_ticket"],
    requiredModules: ["mostrador", "statistics"],
    ctaModuleKeys: ["statistics"],
  }),
  s("mostrador", 16, {
    teaser:
      "Destacá un producto por semana — foco simple, resultado medible.",
    title: "Producto de la semana",
    explanation:
      "Elegir un protagonista semanal concentra esfuerzo de equipo y comunicación. Al final de semana ves si movió la aguja.",
    dataKeys: ["top_volume_product"],
    requiredModules: ["mostrador"],
    ctaModuleKeys: ["mostrador", "promotions"],
  }),
  s("mostrador", 17, {
    teaser:
      "Ordená proveedores en lo que más rotás — mejor precio por volumen.",
    title: "Compras por rotación",
    explanation:
      "Consolidar compras en lo que más sale suele mejorar condiciones. No diversifiques por hábito en lo crítico.",
    dataKeys: ["top_volume_product"],
    requiredModules: ["mostrador", "stock"],
    ctaModuleKeys: ["stock", "purchases"],
  }),
  s("mostrador", 18, {
    teaser:
      "Evitá descuentos sobre lo que ya se vende solo — regalás margen.",
    title: "Descuento con criterio",
    explanation:
      "Promocionar el ítem más pedido a veces no trae cliente nuevo: solo baja ganancia. Mejor promo en valle o en producto rentable.",
    dataKeys: ["top_volume_product", "top_profit_product"],
    requiredModules: ["mostrador", "promotions"],
    ctaModuleKeys: ["promotions", "statistics"],
  }),
  s("mostrador", 19, {
    teaser:
      "Mirá qué hora concentra ventas — ahí tenés que estar fuerte.",
    title: "Tu hora fuerte",
    explanation:
      "Cada negocio tiene horarios donde casi todo pasa. Refuerzo de personal, stock listo y vitrina completa en esa franja.",
    dataKeys: ["peak_hour"],
    requiredModules: ["mostrador", "statistics"],
    ctaModuleKeys: ["statistics"],
  }),
  s("mostrador", 20, {
    teaser:
      "Elegí una mejora por mes — foco único rinde más que diez a la vez.",
    title: "Una mejora por mes",
    explanation:
      "Subir ticket, bajar merma o empujar rentable… elegí una palanca por mes. Así el equipo entiende y se puede medir.",
    dataKeys: ["total_sales"],
    requiredModules: ["mostrador"],
    ctaModuleKeys: ["statistics"],
  }),
]
