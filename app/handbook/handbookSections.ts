/** Contenido editorial del handbook. */
export type HandbookBlock =
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "h3"; text: string }

export type HandbookTopic = {
  id: string
  title: string
  blocks?: HandbookBlock[]
}

export type HandbookSectionMeta = {
  id: string
  title: string
  topics: HandbookTopic[]
}

function topic(title: string, blocks?: HandbookBlock[]): HandbookTopic {
  return {
    id: title
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, ""),
    title,
    blocks,
  }
}

function p(text: string): HandbookBlock {
  return { type: "p", text }
}

function ul(items: string[]): HandbookBlock {
  return { type: "ul", items }
}

function h3(text: string): HandbookBlock {
  return { type: "h3", text }
}

const HANDBOOK_SECTION_META: Record<string, HandbookSectionMeta> = {
  overview: {
    id: "overview",
    title: "Overview",
    topics: [
      topic("Rootsy en síntesis", [
        p("Rootsy es un sistema de gestión online para cualquier negocio. Reúne ventas, stock, operaciones y la información diaria del negocio en un solo lugar, sobre una base contable que permite entender y ordenar lo que pasa de verdad."),
        p("No es solo una herramienta de gestión: Rootsy es un compañero inteligente que observa, conecta datos, ejecuta acciones y ayuda a cada negocio a crecer con más orden, claridad y aire."),
      ]),
      topic("El Handbook", [
        p("Este Handbook reúne los fundamentos que orientan cómo Rootsy piensa, se expresa y se construye."),
      ]),
      topic("Mapa del portal", [
        p("El portal conecta los fundamentos de Rootsy, su marca, su mundo, el producto, la forma de trabajo y sus recursos."),
      ]),
      topic("Foco actual", [
        p("Construir un sistema de gestión rápido, claro y extensible, capaz de resolver operaciones de distintos tipos de negocio sin perder simplicidad."),
      ]),
      topic("Cambios recientes"),
    ],
  },
  vision: {
    id: "vision",
    title: "Visión",
    topics: [
      topic("Product vision", [
        p("Que gestionar un negocio se sienta natural: una experiencia clara en la superficie y profundamente capaz cuando el negocio necesita crecer."),
      ]),
      topic("Misión", [
        p("Dar a cada negocio un sistema simple, veloz e inteligente para gestionar su operación, comprender sus datos y tomar mejores decisiones."),
      ]),
      topic("Ambición a largo plazo", [
        p("Convertir a Rootsy en una base común para cualquier operación que un negocio necesite gestionar, sin importar su rubro, tamaño o plataforma."),
      ]),
      topic("Futuro que queremos construir", [
        p("Un mundo donde más negocios florecen con orden, claridad y crecimiento sostenible; donde esa mejora eleva la oferta, la competencia y la calidad de consumo en las comunidades donde Rootsy está presente."),
      ]),
    ],
  },
  estrategia: {
    id: "estrategia",
    title: "Estrategia",
    topics: [
      topic("Objetivos estratégicos", [
        ul([
          "Simplificar la gestión de cualquier negocio.",
          "Convertir datos operativos en decisiones más claras.",
          "Extender Rootsy a nuevos tipos de operación y rubros.",
          "Hacer que la inteligencia de Rootsy sea una ventaja cotidiana para cada usuario.",
        ]),
      ]),
      topic("Prioridades", [
        ul([
          "Base contable sólida.",
          "Gestión veloz y clara.",
          "Experiencia simple, aun frente a operaciones complejas.",
          "Expansión modular hacia nuevos casos de uso.",
        ]),
      ]),
      topic("Apuestas"),
      topic("Criterios de decisión"),
      topic("Horizonte de planificación"),
    ],
  },
  principios: {
    id: "principios",
    title: "Principios",
    topics: [
      topic("Principios de producto", [
        ul([
          "Naturalidad: todo debe entenderse al primer contacto.",
          "Simplicidad: mostrar lo necesario, con jerarquías claras.",
          "Velocidad: la gestión cotidiana no debe sentirse pesada.",
          "Profundidad progresiva: simple en la superficie, capaz en profundidad.",
          "Contexto: ningún dato ni decisión se entiende de manera aislada.",
        ]),
      ]),
      topic("Principios de marca", [
        ul([
          "Cercanía sin infantilizar.",
          "Inteligencia sin frialdad.",
          "Naturaleza sin decoración vacía.",
          "Claridad antes que espectacularidad.",
          "Autenticidad antes que promesas abstractas.",
        ]),
      ]),
      topic("Principios de decisión", [
        ul([
          "Buscar movimientos que ordenen más de una parte del negocio.",
          "Considerar impacto, tensión y equilibrio antes de orientar.",
          "Usar datos reales y pedir contexto cuando haga falta.",
          "No optimizar una métrica a costa del negocio completo.",
        ]),
      ]),
      topic("No negociables", [
        ul([
          "No inventar datos ni conclusiones.",
          "No agregar fricción innecesaria.",
          "No usar complejidad visual como adorno.",
          "No separar la experiencia de lo que realmente sucede en el negocio.",
        ]),
      ]),
      topic("Trade-offs"),
    ],
  },
  "plataforma-de-marca": {
    id: "plataforma-de-marca",
    title: "Plataforma de marca",
    topics: [
      topic("Esencia", [
        p("Tu negocio está en buenas patas."),
      ]),
      topic("Posicionamiento", [
        p("Rootsy es un sistema de gestión online que combina una base operativa y contable sólida con una experiencia simple y una inteligencia cercana para ayudar a cualquier negocio a crecer con claridad."),
      ]),
      topic("Propuesta de valor", [
        p("Gestionar, entender y hacer crecer un negocio desde un único lugar, con velocidad, simplicidad y el acompañamiento de una inteligencia que conoce su contexto."),
      ]),
      topic("Audiencias", [
        p("Negocios pequeños, medianos y grandes; comercios, gastronomía, fabricación, servicios y futuros rubros que requieran gestionar operaciones."),
      ]),
      topic("Personalidad", [
        p("Rootsy es curioso, observador, ágil, cálido y preciso. Tiene la cercanía de un compañero y la capacidad de una inteligencia experta. Nunca es infantil, caricaturesco, distante ni corporativo."),
      ]),
      topic("Narrativa de marca", [
        p("Rootsy habita un mundo digital que percibe como un entorno natural y vivo. Ese mundo se nutre del movimiento de los negocios: cuando encuentran orden, claridad y crecimiento sostenible, el mundo florece."),
      ]),
    ],
  },
  "voz-y-tono": {
    id: "voz-y-tono",
    title: "Voz y tono",
    topics: [
      topic("Voz", [
        p("Cálida, clara, natural y argentina en un registro moderado. Cercana sin exceso de confianza; experta sin solemnidad."),
      ]),
      topic("Tonos", [
        ul([
          "Calmo y claro cuando hay equilibrio.",
          "Preciso y cuidadoso cuando hay tensión.",
          "Ágil y concreto frente a acciones cotidianas.",
          "Cercano al acompañar decisiones importantes.",
        ]),
      ]),
      topic("Principios de escritura", [
        ul([
          "Hablar con claridad y criterio.",
          "Nombrar lo que se observa sin exagerar.",
          "Priorizar acciones y consecuencias concretas.",
          "Evitar frases hechas, tecnicismos innecesarios y tono corporativo.",
        ]),
      ]),
      topic("Arquitectura de mensajes"),
      topic("Naming"),
      topic("Ejemplos"),
    ],
  },
  "identidad-visual": {
    id: "identidad-visual",
    title: "Identidad visual",
    topics: [
      topic("Logotipo", [
        p("El logotipo es la firma de la plataforma. Se reconoce por dos piezas que trabajan juntas: el logomark — el tile con la R — y el wordmark — la palabra Rootsy. El lockup completo es el uso por defecto. El mark solo aparece cuando el nombre ya está dicho en la misma superficie."),
        p("Rootsy y el negocio no compiten. La identidad del POP es su foto y su nombre comercial, escritos con tipografía nativa. Rootsy aparece para orientar la plataforma; el negocio habla por sí mismo."),
        h3("Variantes"),
        ul([
          "Brand: lockup sobre superficies claras — producto, documentos y email.",
          "Inverse: lockup blanco sobre savia o sombra — landing, login y héroes.",
          "Neutral: uso de bajo contraste — pies, watermarks y contextos secundarios.",
        ]),
        p("Los assets y las reglas de tamaño, respiro y alt-text viven en la librería. Acá se decide cuándo aparece la marca; allá se especifica cómo se dibuja."),
      ]),
      topic("Color", [
        p("El color de Rootsy no es una paleta decorativa. Son tres familias que nombran lugares del mundo: sombra, bruma y savia. Cada tono tiene un trabajo. Si un color no ordena, no entra."),
        ul([
          "Sombra: el dosel. Rails, catálogos y superficies que contienen. Es el bosque, no el negro genérico.",
          "Bruma: el aire. Fondos, lectura y workspaces claros. Es neblina para ver, no gris de sistema.",
          "Savia: la vida. Acción, foco y confirmación. Aparece poco, y solo donde hay que moverse.",
        ]),
        p("Los colores funcionales — aviso, error, información — existen fuera de esas tres familias. No se disfrazan de savia ni de sombra. Los mundos del producto (éter, suelo, herramientas) son hábitats: cambian el aire de una pantalla, no inventan una cuarta marca."),
        p("La semántica, las rampas y los temas viven en la librería. Acá vale una sola regla: savia donde hay acción; bruma donde se lee; sombra donde se contiene."),
      ]),
      topic("Tipografía", [
        p("La tipografía se lee sin esfuerzo. El texto guía; no compite con la interfaz. Hay tres voces y cada una hace una sola cosa."),
        ul([
          "UI — Nunito Sans: la voz del producto. Títulos, labels, botones y formularios.",
          "Lectura — Source Sans 3: la voz de la prosa. Ayudas, artículos y bloques largos.",
          "Números — Inter: la voz de los montos. Tabular, precisa, sin adorno.",
        ]),
        p("La jerarquía es obvia: título, contexto, cuerpo, dato. La escala es corta y parte de 16px. Si hace falta más énfasis, se sube o se baja un nivel — no se inventa un tamaño suelto. Pesos con intención: regular para leer, semibold para decidir, bold solo cuando el dato tiene que quedar."),
        p("La escala, los tokens y los ejemplos de aplicación están en la librería."),
      ]),
      topic("Sistema gráfico", [
        p("El sistema gráfico es el idioma con el que el mundo se vuelve interfaz. No es un catálogo de efectos. Es un conjunto chico de decisiones que se reconocen en cualquier pantalla: formas claras, proporciones que respiran, movimiento orgánico y profundidad ligera."),
        ul([
          "Forma: bloques y controles con contorno definido. El radio crece con el contenedor — más cerrado en datos densos, más abierto en cards y overlay.",
          "Profundidad: elevación de bruma, no de teatro. Una sombra alcanza para decir qué está encima.",
          "Movimiento: inercia creíble. Acelera y frena como un cuerpo, no como un easing de plantilla.",
          "Detalle: la naturaleza aparece como lenguaje — un borde, un aire, un foco — nunca como wallpaper.",
        ]),
        p("Iconografía, radio, elevación, borde y motion se especifican en la librería. El handbook fija el criterio: si un detalle no ayuda a entender o a actuar, sobra."),
      ]),
      topic("Imagen y fotografía", [
        p("La imagen de Rootsy tiene que aportar comprensión, calma y sentido. No llena un vacío. Un recorte vale cuando nombra el territorio: cielo abierto, parque vivo, bruma, savia, crecimiento. No vale cuando es oficina genérica, fantasía recargada o naturaleza de catálogo."),
        p("La fotografía de negocios es concreta: oficios, mostradores, materia, manos en el trabajo. Se ve el mundo real que Rootsy ordena, no un lifestyle abstracto. La luz es clara; el encuadre, quieto."),
        p("La ilustración sigue la misma paleta y el mismo criterio. Spots para estados y onboarding. La mascota actúa y acompaña; no posa ni reemplaza al logo. Los patrones ambient quedan atrás, como bruma — nunca compiten con un dato."),
      ]),
      topic("Composición", [
        p("Componer en Rootsy es dejar aire y una sola decisión visible. La mirada tiene que saber, al primer contacto, qué está pasando y cuál es el próximo movimiento."),
        ul([
          "Respiro: márgenes y ritmos de la escala de spacing. El vacío es parte de la marca.",
          "Foco: una acción savia por superficie. El resto espera.",
          "Progresión: simple al entrar, profundo si el negocio lo pide. Nada de mostrar todo a la vez.",
          "Alineación: una grilla, un eje. Las piezas se sientan; no flotan.",
        ]),
        p("En marketing, el lockup y un plano de mundo alcanzan. En producto, ganan los datos y los controles. Si la composición pide explicación, está sobrecargada."),
      ]),
      topic("Usos y restricciones", [
        p("La identidad se sostiene por lo que no se hace. Estas reglas no se negocian en una campaña, un módulo ni una pieza suelta."),
        h3("Hacer"),
        ul([
          "Usar los assets oficiales del lockup y del logomark, sin redibujarlos.",
          "Respetar el respiro del logo y su contraste sobre bruma, sombra o savia.",
          "Dejar que el POP se presente con su foto y su nombre.",
          "Aplicar color, tipo y forma desde la librería.",
          "Usar savia para acción y foco, no para pintar superficies enteras.",
        ]),
        h3("Evitar"),
        ul([
          "Estirar, rotar, recortar o agregar sombras, brillos o contornos al logo.",
          "Reemplazar el wordmark por otra tipografía, o el tile por un círculo o un ícono genérico.",
          "Inventar verdes, grises o degradados fuera de sombra, bruma y savia.",
          "Usar naturaleza, mascota o patrones como adorno de fondo.",
          "Poner a Rootsy y al negocio a competir por el mismo lugar de la pantalla.",
          "Tratar la complejidad visual como señal de calidad.",
        ]),
      ]),
    ],
  },
  territorio: {
    id: "territorio",
    title: "Territorio",
    topics: [
      topic("Territorios culturales", [
        p("Un mundo natural llevado a lo digital: abierto, vivo, respirable y en equilibrio."),
      ]),
      topic("Referencias", [
        p("Paisaje nocturno despejado, parque vivo, bruma, savia, movimiento orgánico, cielo abierto y crecimiento natural."),
      ]),
      topic("Códigos visuales", [
        p("La naturaleza no aparece como decoración: es el lenguaje con el que Rootsy interpreta un sistema digital complejo."),
      ]),
      topic("Temas propios", [
        p("Orden, aire, equilibrio, movimiento, claridad, crecimiento y florecimiento."),
      ]),
      topic("Límites del territorio", [
        p("El mundo de Rootsy no es fantasía recargada ni una interfaz fría. La naturaleza debe aportar comprensión, calma y sentido."),
      ]),
    ],
  },
  comunidad: {
    id: "comunidad",
    title: "Comunidad",
    topics: [
      topic("Personas", [
        p("Cada persona accede a la parte del mundo de Rootsy vinculada con su negocio."),
      ]),
      topic("Relación con la comunidad", [
        p("Rootsy acompaña a quienes gestionan negocios como un aliado que observa, comprende y ayuda a avanzar."),
      ]),
      topic("Rituales"),
      topic("Participación"),
      topic("Historias"),
    ],
  },
  ecosistema: {
    id: "ecosistema",
    title: "Ecosistema",
    topics: [
      topic("Plataformas", [
        p("Rootsy puede existir en web, mobile y escritorio, manteniendo una experiencia coherente."),
      ]),
      topic("Productos vinculados", [
        p("La base contable y operativa permite sumar módulos, operaciones y productos adaptados a nuevas necesidades de negocio."),
      ]),
      topic("Partners"),
      topic("Extensiones de marca"),
      topic("Puntos de contacto", [
        p("La aplicación es la entrada al mundo de Rootsy: el lugar donde el negocio ve, entiende y gestiona su realidad."),
      ]),
    ],
  },
  producto: {
    id: "producto",
    title: "Producto",
    topics: [
      topic("Arquitectura de producto", [
        p("Rootsy se apoya en una base contable. Cada operación y dato del negocio se relaciona con esa base, permitiendo gestionar con consistencia y extender el sistema sin perder coherencia."),
      ]),
      topic("Plataformas", [
        p("Web como entorno principal, con posibilidad de extender la experiencia a mobile y escritorio."),
      ]),
      topic("Capacidades", [
        h3("Capacidades actuales"),
        ul([
          "Comercio.",
          "Mesas y mostrador.",
          "Fabricación basada en recetas.",
          "Servicios.",
        ]),
        h3("Capacidades futuras"),
        p("Reservas, alquileres y nuevos módulos específicos para distintos modelos de negocio."),
      ]),
      topic("Líneas de producto"),
      topic("Ciclo de vida"),
    ],
  },
  experiencia: {
    id: "experiencia",
    title: "Experiencia",
    topics: [
      topic("Principios de experiencia", [
        ul([
          "Comprensión inmediata.",
          "Gestión ágil.",
          "Complejidad progresiva.",
          "Información clara.",
          "Interacciones naturales.",
          "Velocidad como parte de la calidad.",
        ]),
      ]),
      topic("Journeys"),
      topic("Navegación"),
      topic("Momentos clave", [
        ul([
          "Entender rápidamente qué está pasando.",
          "Ejecutar operaciones cotidianas.",
          "Profundizar cuando el negocio lo necesita.",
          "Conversar con Rootsy para pedir acciones, consultar datos y recibir orientación.",
        ]),
      ]),
      topic("Accesibilidad", [
        p("La claridad, las jerarquías legibles y las acciones predecibles son condiciones básicas de la experiencia."),
      ]),
    ],
  },
  "sistema-de-diseno": {
    id: "sistema-de-diseno",
    title: "Sistema de diseño",
    topics: [
      topic("Foundations", [
        ul([
          "Formas claras.",
          "Proporciones naturales.",
          "Color con función.",
          "Movimiento orgánico.",
          "Profundidad ligera y útil.",
        ]),
      ]),
      topic("Componentes"),
      topic("Patrones", [
        p("La interfaz debe mostrar el mundo de Rootsy mediante detalles sutiles y funcionales, no mediante exceso de animación, tridimensionalidad o efectos."),
      ]),
      topic("Tokens"),
      topic("Contribuciones"),
    ],
  },
  contenido: {
    id: "contenido",
    title: "Contenido",
    topics: [
      topic("Estrategia de contenido"),
      topic("Tipos de contenido"),
      topic("UX writing", [
        p("El contenido debe ser directo, natural y fácil de entender. Rootsy explica, orienta y acompaña sin sonar técnico, infantil ni corporativo."),
      ]),
      topic("Estándares editoriales", [
        ul([
          "Decir qué sucede.",
          "Explicar qué importa.",
          "Proponer el próximo movimiento cuando corresponde.",
          "No inventar resultados ni datos.",
        ]),
      ]),
      topic("Ciclo de contenido"),
    ],
  },
  organizacion: {
    id: "organizacion",
    title: "Organización",
    topics: [
      topic("Mapa de equipo"),
      topic("Roles"),
      topic("Responsabilidades"),
      topic("Derechos de decisión"),
      topic("Colaboradores externos"),
    ],
  },
  "forma-de-trabajo": {
    id: "forma-de-trabajo",
    title: "Forma de trabajo",
    topics: [
      topic("Rituales"),
      topic("Planificación"),
      topic("Proceso de entrega"),
      topic("Colaboración"),
      topic("Documentación"),
    ],
  },
  impacto: {
    id: "impacto",
    title: "Impacto",
    topics: [
      topic("Hipótesis de impacto", [
        p("Rootsy ayuda a que los negocios se ordenen, comprendan mejor su operación y crezcan de manera sostenible. Ese crecimiento puede elevar la competencia, mejorar la oferta y fortalecer la calidad del consumo en los mercados donde Rootsy está presente."),
      ]),
      topic("North Star Metric"),
      topic("Objetivos"),
      topic("Métricas"),
      topic("Experimentos"),
      topic("Aprendizajes"),
      topic("Revisiones"),
    ],
  },
  biblioteca: {
    id: "biblioteca",
    title: "Biblioteca",
    topics: [
      topic("Assets de marca"),
      topic("Assets de producto"),
      topic("Documentos"),
      topic("Casos"),
      topic("Archivo"),
    ],
  },
  plantillas: {
    id: "plantillas",
    title: "Plantillas",
    topics: [
      topic("Briefs"),
      topic("Presentaciones"),
      topic("Documentos"),
      topic("Lanzamientos"),
      topic("Comunicaciones"),
    ],
  },
  actualizaciones: {
    id: "actualizaciones",
    title: "Actualizaciones",
    topics: [
      topic("Changelog"),
      topic("Solicitudes"),
      topic("Contribuciones"),
      topic("Responsables"),
    ],
  },
}

export function getHandbookSectionMeta(sectionId: string): HandbookSectionMeta | undefined {
  return HANDBOOK_SECTION_META[sectionId]
}
