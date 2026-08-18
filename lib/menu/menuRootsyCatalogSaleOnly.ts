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

/** Solo acceso a Vender — sin precios, stock ni promos en el copy. */
export const MENU_ROOTSY_CATALOG_SALE_ONLY: MenuRootsyCatalogSuggestion[] = [
  s("sale_only", 1, {
    teaser:
      "Saludá primero y sonreí: la primer impresión define si el cliente vuelve mañana.",
    title: "La bienvenida cuenta",
    explanation:
      "Antes de preguntar qué quiere, una bienvenida clara y amable baja la tensión del cliente. No hace falta un discurso: alcanza con un hola y estar atento. Ese primer contacto es gratis y se nota en las ventas del día.",
    dataKeys: ["total_sales"],
    requiredModules: ["sale"],
    ctaModuleKeys: ["sale"],
  }),
  s("sale_only", 2, {
    teaser:
      "Ofrecé acompañar la compra principal con algo chico — muchos dicen que sí.",
    title: "Sumá algo chico a cada venta",
    explanation:
      "No es presionar: es ayudar. Después de lo que pidió, una pregunta simple (“¿Le sumo algo para tomar?”) suele subir el total sin molestar. Lo importante es que sea rápido y coherente con lo que ya lleva.",
    dataKeys: ["avg_ticket"],
    requiredModules: ["sale"],
    ctaModuleKeys: ["sale"],
  }),
  s("sale_only", 3, {
    teaser:
      "Tener listo lo más pedido acelera la fila y evita que se vayan sin comprar.",
    title: "Lo popular al alcance",
    explanation:
      "Si cada venta tarda porque hay que buscar el producto, perdés gente en hora pico. Dejá visible y a mano lo que más sale. Menos pasos = más ventas en el mismo tiempo.",
    dataKeys: ["top_volume_product"],
    requiredModules: ["sale"],
    ctaModuleKeys: ["sale"],
  }),
  s("sale_only", 4, {
    teaser:
      "En hora pico, frases cortas y opciones claras — menos dudas, más ventas.",
    title: "Simplicá cuando hay fila",
    explanation:
      "Cuando hay mucha gente, no es momento de explicar todo el menú. Ofrecé dos o tres opciones concretas. El cliente decide más rápido y la fila avanza.",
    dataKeys: ["peak_hour"],
    requiredModules: ["sale"],
    ctaModuleKeys: ["sale"],
  }),
  s("sale_only", 5, {
    teaser:
      "Repetí el pedido antes de cobrar — evita errores que cuestan plata y confianza.",
    title: "Confirmá antes de cobrar",
    explanation:
      "Un error en el pedido se arregla con tiempo y buena onda, pero cuesta. Repetir en voz alta lo que va en la venta tarda cinco segundos y previene devoluciones y caras largas.",
    dataKeys: [],
    requiredModules: ["sale"],
    ctaModuleKeys: ["sale"],
  }),
  s("sale_only", 6, {
    teaser:
      "Si el cliente duda, recomendá una opción — la gente valora que le faciliten elegir.",
    title: "Una recomendación clara",
    explanation:
      "Cuando alguien no sabe qué pedir, quedarse en silencio no ayuda. Decí cuál es la opción más pedida o tu favorita del día. Eso ordena la decisión y suele cerrar la venta.",
    dataKeys: ["top_volume_product"],
    requiredModules: ["sale"],
    ctaModuleKeys: ["sale"],
  }),
  s("sale_only", 7, {
    teaser:
      "Agrupá lo que suele ir junto cerca del mostrador — se vende casi solo.",
    title: "Juntá lo que combina",
    explanation:
      "Café y algo dulce, pan y fiambre… si están cerca, el cliente los ve juntos. No hace falta promo: la cercanía ya sugiere la compra.",
    dataKeys: [],
    requiredModules: ["sale"],
    ctaModuleKeys: ["sale"],
  }),
  s("sale_only", 8, {
    teaser:
      "Entre venta y venta, reponé lo que se vació — un hueco en góndola frena la próxima.",
    title: "No dejes huecos visibles",
    explanation:
      "Si el cliente no ve el producto, asume que no hay. Reponer en el momento evita perder la venta siguiente. Es hábito de mostrador, no de depósito.",
    dataKeys: [],
    requiredModules: ["sale"],
    ctaModuleKeys: ["sale"],
  }),
  s("sale_only", 9, {
    teaser:
      "Agradecé al final — suena simple, pero hace que vuelvan.",
    title: "Cerrá con gracias",
    explanation:
      "El cierre de la venta es la última sensación que se lleva el cliente. Un gracias genuino deja mejor sabor que cualquier descuento chico.",
    dataKeys: [],
    requiredModules: ["sale"],
    ctaModuleKeys: ["sale"],
  }),
  s("sale_only", 10, {
    teaser:
      "Si hay momento tranquilo, ordená el mostrador — vendés mejor con todo visible.",
    title: "Orden en horas tranquilas",
    explanation:
      "En el valle del día, usar cinco minutos para ordenar etiquetas y frente de góndola prepara el rush. Cuando llegue gente, todo fluye.",
    dataKeys: ["slow_hour"],
    requiredModules: ["sale"],
    ctaModuleKeys: ["sale"],
  }),
  s("sale_only", 11, {
    teaser:
      "Aprendé los nombres de los clientes frecuentes — vuelven más cuando se sienten conocidos.",
    title: "Clientes habituales",
    explanation:
      "No hace falta recordar todos: con los que vienen seguido, un nombre o un “lo de siempre” genera lealtad. Eso se traduce en ventas estables.",
    dataKeys: ["total_sales"],
    requiredModules: ["sale"],
    ctaModuleKeys: ["sale"],
  }),
  s("sale_only", 12, {
    teaser:
      "Explicá en una frase qué trae de nuevo un producto — la novedad vende sola.",
    title: "Contá la novedad en una frase",
    explanation:
      "Si hay algo nuevo, decir en pocas palabras qué es y por qué probarlo ayuda más que dejar la etiqueta sola. El cliente necesita una excusa para animarse.",
    dataKeys: [],
    requiredModules: ["sale"],
    ctaModuleKeys: ["sale"],
  }),
  s("sale_only", 13, {
    teaser:
      "Si hay fila, avisá el tiempo de espera — la paciencia sube cuando saben cuánto falta.",
    title: "Gestión de fila",
    explanation:
      "Un “dos minutos y lo tiene” calma. El cliente prefiere esperar informado a irse sin comprar.",
    dataKeys: ["peak_hour"],
    requiredModules: ["sale"],
    ctaModuleKeys: ["sale"],
  }),
  s("sale_only", 14, {
    teaser:
      "Ofrecé llevar o consumir acá según lo que el cliente trae — adaptate al momento.",
    title: "Para llevar o acá",
    explanation:
      "Preguntar cómo lo quiere muestra atención y evita errores de empaque o servicio. Es detalle chico, impacto grande en satisfacción.",
    dataKeys: [],
    requiredModules: ["sale"],
    ctaModuleKeys: ["sale"],
  }),
  s("sale_only", 15, {
    teaser:
      "Cuando alguien compra para varios, sugerí armar un solo pedido — simplifica y sube ticket.",
    title: "Pedidos para compartir",
    explanation:
      "Grupos y familias a veces piden de a uno. Proponer armar algo para compartir ordena la venta y suele sumar unidades.",
    dataKeys: ["avg_ticket"],
    requiredModules: ["sale"],
    ctaModuleKeys: ["sale"],
  }),
  s("sale_only", 16, {
    teaser:
      "Si un producto no está, ofrecé alternativa al toque — mejor eso que “no hay”.",
    title: "Siempre una alternativa",
    explanation:
      "Quedarse en “no tenemos” cierra la venta. Tener a mano un reemplazo razonable salva el ticket y la experiencia.",
    dataKeys: [],
    requiredModules: ["sale"],
    ctaModuleKeys: ["sale"],
  }),
  s("sale_only", 17, {
    teaser:
      "Al cobrar, mirá que el monto en pantalla coincida — evita fricción al final.",
    title: "Cierre de cobro claro",
    explanation:
      "Mostrar el total, confirmar medio de pago y entregar ticket cuando corresponda cierra la venta sin dudas. Menos reclamos, más fluidez.",
    dataKeys: [],
    requiredModules: ["sale"],
    ctaModuleKeys: ["sale"],
  }),
  s("sale_only", 18, {
    teaser:
      "Los lunes suelen arrancar flojos — un extra de energía en atención ayuda a despegar.",
    title: "Arranque de semana",
    explanation:
      "El inicio de semana cuesta para todos. Una atención un poco más proactiva esos días puede empujar ventas sin cambiar nada del negocio.",
    dataKeys: ["sales_delta"],
    requiredModules: ["sale"],
    ctaModuleKeys: ["sale"],
  }),
  s("sale_only", 19, {
    teaser:
      "Si vendés comida, preguntá si es para ahora — así priorizás lo urgente.",
    title: "Prioridad en comida",
    explanation:
      "Lo caliente y lo para llevar no van al mismo ritmo. Una pregunta al inicio ordena la cocina y mejora tiempos.",
    dataKeys: [],
    requiredModules: ["sale"],
    ctaModuleKeys: ["sale"],
  }),
  s("sale_only", 20, {
    teaser:
      "Al final del turno, anotá qué se agotó — mañana lo tenés antes de abrir.",
    title: "Aprendizaje del turno",
    explanation:
      "Sin entrar en stock formal, saber qué se terminó hoy ayuda a preparar mañana. Es memoria del mostrador: simple y muy efectiva.",
    dataKeys: ["top_volume_product"],
    requiredModules: ["sale"],
    ctaModuleKeys: ["sale"],
  }),
]
