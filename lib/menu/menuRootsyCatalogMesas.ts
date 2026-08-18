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

export const MENU_ROOTSY_CATALOG_MESAS: MenuRootsyCatalogSuggestion[] = [
  s("mesas", 1, {
    teaser:
      "Saludá en los primeros 30 segundos — la mesa que se siente ignorada no vuelve.",
    title: "Recepción en mesa",
    explanation:
      "El tiempo hasta la primera atención marca la experiencia. Un saludo y agua o menú al sentarse ya cambia la percepción del servicio.",
    dataKeys: [],
    requiredModules: ["mesas"],
    ctaModuleKeys: ["mesas"],
  }),
  s("mesas", 2, {
    teaser:
      "Sugerí entrada o bebida mientras eligen — ordena la mesa y sube ticket.",
    title: "Apertura de mesa",
    explanation:
      "Mientras deciden platos principales, una bebida o entrada compartida arranca la venta y da tiempo sin presión.",
    dataKeys: ["avg_ticket"],
    requiredModules: ["mesas"],
    ctaModuleKeys: ["mesas", "statistics"],
  }),
  s("mesas", 3, {
    teaser:
      "Rotación de mesa: cerrá cuenta cuando terminaron — no cuando piden.",
    title: "Rotación de mesas",
    explanation:
      "Detectar fin de comida y ofrecer cuenta o postre evita mesas ocupadas sin consumo. Más rotación = más cubiertos en el mismo salón.",
    dataKeys: ["peak_hour"],
    requiredModules: ["mesas"],
    ctaModuleKeys: ["mesas"],
  }),
  s("mesas", 4, {
    teaser:
      "Plato rentable como recomendación del día — guía sin abrumar.",
    title: "Recomendación del día",
    explanation:
      "Un plato bien elegido (buen margen y fácil de ejecutar) como sugerencia del mozo orienta al cliente y cuida cocina.",
    dataKeys: ["top_profit_product"],
    requiredModules: ["mesas", "statistics"],
    ctaModuleKeys: ["statistics", "mesas"],
  }),
  s("mesas", 5, {
    teaser:
      "En hora pico, tiempos claros — mejor decir 20 minutos que dejar adivinar.",
    title: "Tiempos honestos",
    explanation:
      "Prometer menos de lo que podés cumplir genera quejas. Comunicar demora real en cocina mantiene confianza en rush.",
    dataKeys: ["peak_hour"],
    requiredModules: ["mesas"],
    ctaModuleKeys: ["mesas"],
  }),
  s("mesas", 6, {
    teaser:
      "Postre o café al final — muchos dicen que sí si se ofrece bien.",
    title: "Cierre dulce",
    explanation:
      "Después del plato principal, una oferta simple de postre o café alcanza para redondear ticket sin pesadez.",
    dataKeys: ["avg_ticket"],
    requiredModules: ["mesas"],
    ctaModuleKeys: ["mesas"],
  }),
  s("mesas", 7, {
    teaser:
      "Mesas chicas vs grandes: asigná según grupo — evita sillas vacías.",
    title: "Ubicación inteligente",
    explanation:
      "Sentar dos personas en mesa de seis frena rotación. Ajustar ubicación según tamaño de grupo optimiza salón.",
    dataKeys: [],
    requiredModules: ["mesas"],
    ctaModuleKeys: ["mesas"],
  }),
  s("mesas", 8, {
    teaser:
      "Carta acotada en servicio = cocina más rápida y menos errores.",
    title: "Menú operativo",
    explanation:
      "Demasiadas opciones en hora pico complican cocina y servicio. Un menú del día o carta reducida en rush mejora tiempos.",
    dataKeys: [],
    requiredModules: ["mesas"],
    ctaModuleKeys: ["mesas"],
  }),
  s("mesas", 9, {
    teaser:
      "Vino o bebida que combina con el plato — una frase ayuda a elegir.",
    title: "Maridaje simple",
    explanation:
      "No hace falta sommelier: una sugerencia de bebida que va con lo pedido eleva ticket y experiencia.",
    dataKeys: ["avg_ticket"],
    requiredModules: ["mesas"],
    ctaModuleKeys: ["mesas"],
  }),
  s("mesas", 10, {
    teaser:
      "Reservas + walk-in: dejá mesas libres para quien llega sin aviso.",
    title: "Balance reservas",
    explanation:
      "Si todo está reservado y llega gente, perdés venta. Mantener flexibilidad según día y hora equilibra salón.",
    dataKeys: ["slow_hour", "peak_hour"],
    requiredModules: ["mesas"],
    ctaModuleKeys: ["mesas"],
  }),
  s("mesas", 11, {
    teaser:
      "Platos que salen lento: avisá al cliente al pedir — evita reclamos.",
    title: "Expectativas claras",
    explanation:
      "Si un plato tarda, decirlo al tomar pedido es profesional. Sorpresa en la espera es lo que molesta.",
    dataKeys: [],
    requiredModules: ["mesas"],
    ctaModuleKeys: ["mesas"],
  }),
  s("mesas", 12, {
    teaser:
      "Compartir platos grandes — sube ticket y satisfacción en grupos.",
    title: "Para compartir",
    explanation:
      "Propuestas para dividir funcionan bien en grupos. Facilita elección y suele sumar un extra (pan, salsa, bebida).",
    dataKeys: ["avg_ticket"],
    requiredModules: ["mesas"],
    ctaModuleKeys: ["mesas"],
  }),
  s("mesas", 13, {
    teaser:
      "Turno de almuerzo: menú ejecutivo claro acelera todo.",
    title: "Almuerzo ágil",
    explanation:
      "En horario laboral, opciones rápidas y precio claro rotan mesas. El cliente valora salir a horario.",
    dataKeys: ["peak_hour"],
    requiredModules: ["mesas"],
    ctaModuleKeys: ["mesas", "promotions"],
  }),
  s("mesas", 14, {
    teaser:
      "Revisá qué platos se piden juntos — armá sugerencias naturales.",
    title: "Pedidos que van juntos",
    explanation:
      "Mirar combinaciones frecuentes permite sugerir sin forzar. Es venta consultiva, no empuje.",
    dataKeys: ["top_volume_product"],
    requiredModules: ["mesas", "statistics"],
    ctaModuleKeys: ["statistics"],
  }),
  s("mesas", 15, {
    teaser:
      "Margen por plato: empujá los que dejan más sin sacar los populares.",
    title: "Mix rentable",
    explanation:
      "Los platos estrella traen gente; los rentables sostienen negocio. Balanceá recomendaciones entre ambos.",
    dataKeys: ["top_profit_product", "top_volume_product"],
    requiredModules: ["mesas", "statistics"],
    ctaModuleKeys: ["statistics"],
  }),
  s("mesas", 16, {
    teaser:
      "Cena floja: promo de bebida o postre puede traer mesas extra.",
    title: "Activar cena tranquila",
    explanation:
      "En noches flojas, una propuesta acotada en salón puede llenar mesas sin tocar almuerzo fuerte.",
    dataKeys: ["slow_hour"],
    requiredModules: ["mesas", "promotions"],
    ctaModuleKeys: ["promotions"],
  }),
  s("mesas", 17, {
    teaser:
      "Feedback al cobrar — una pregunta genuina mejora sin encuestas largas.",
    title: "Escuchar al irse",
    explanation:
      "“¿Cómo estuvo todo?” al cerrar mesa detecta problemas temprano y muestra cuidado.",
    dataKeys: [],
    requiredModules: ["mesas"],
    ctaModuleKeys: ["mesas"],
  }),
  s("mesas", 18, {
    teaser:
      "Capacitá al equipo en tres upsells concretos — no diez.",
    title: "Tres upsells del salón",
    explanation:
      "Elegir tres sugerencias entrenables (bebida, entrada, postre) alinea al equipo y mide resultados.",
    dataKeys: ["avg_ticket"],
    requiredModules: ["mesas"],
    ctaModuleKeys: ["mesas"],
  }),
  s("mesas", 19, {
    teaser:
      "Compará ventas por franja — sabé cuándo abrir más personal.",
    title: "Personal según hora",
    explanation:
      "Almuerzo vs cena vs fin de semana tienen ritmos distintos. Ajustar turnos a datos evita quedar corto o sobredimensionado.",
    dataKeys: ["peak_hour", "total_sales"],
    requiredModules: ["mesas", "statistics"],
    ctaModuleKeys: ["statistics"],
  }),
  s("mesas", 20, {
    teaser:
      "Un foco por mes en salón — rotación, ticket o satisfacción.",
    title: "Mejora mensual en salón",
    explanation:
      "Elegir una meta simple por mes (más rotación, más ticket, menos demora) concentra al equipo.",
    dataKeys: ["total_sales"],
    requiredModules: ["mesas"],
    ctaModuleKeys: ["statistics"],
  }),
]
