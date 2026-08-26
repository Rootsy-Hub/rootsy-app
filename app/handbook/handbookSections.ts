export type HandbookTopic = {
  id: string
  title: string
}

export type HandbookSectionMeta = {
  id: string
  title: string
  topics: HandbookTopic[]
}

function topic(title: string): HandbookTopic {
  return {
    id: title
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, ""),
    title,
  }
}

const HANDBOOK_SECTION_META: Record<string, HandbookSectionMeta> = {
  overview: {
    id: "overview",
    title: "Overview",
    topics: [
      topic("Rootsy en síntesis"),
      topic("El Handbook"),
      topic("Mapa del portal"),
      topic("Foco actual"),
      topic("Cambios recientes"),
    ],
  },
  vision: {
    id: "vision",
    title: "Visión",
    topics: [
      topic("Product vision"),
      topic("Misión"),
      topic("Ambición a largo plazo"),
      topic("Futuro que queremos construir"),
    ],
  },
  estrategia: {
    id: "estrategia",
    title: "Estrategia",
    topics: [
      topic("Objetivos estratégicos"),
      topic("Prioridades"),
      topic("Apuestas"),
      topic("Criterios de decisión"),
      topic("Horizonte de planificación"),
    ],
  },
  principios: {
    id: "principios",
    title: "Principios",
    topics: [
      topic("Principios de producto"),
      topic("Principios de marca"),
      topic("Principios de decisión"),
      topic("No negociables"),
      topic("Trade-offs"),
    ],
  },
  "plataforma-de-marca": {
    id: "plataforma-de-marca",
    title: "Plataforma de marca",
    topics: [
      topic("Esencia"),
      topic("Posicionamiento"),
      topic("Propuesta de valor"),
      topic("Audiencias"),
      topic("Personalidad"),
      topic("Narrativa de marca"),
    ],
  },
  "voz-y-tono": {
    id: "voz-y-tono",
    title: "Voz y tono",
    topics: [
      topic("Voz"),
      topic("Tonos"),
      topic("Principios de escritura"),
      topic("Arquitectura de mensajes"),
      topic("Naming"),
      topic("Ejemplos"),
    ],
  },
  "identidad-visual": {
    id: "identidad-visual",
    title: "Identidad visual",
    topics: [
      topic("Logotipo"),
      topic("Color"),
      topic("Tipografía"),
      topic("Sistema gráfico"),
      topic("Imagen y fotografía"),
      topic("Composición"),
      topic("Usos y restricciones"),
    ],
  },
  territorio: {
    id: "territorio",
    title: "Territorio",
    topics: [
      topic("Territorios culturales"),
      topic("Referencias"),
      topic("Códigos visuales"),
      topic("Temas propios"),
      topic("Límites del territorio"),
    ],
  },
  comunidad: {
    id: "comunidad",
    title: "Comunidad",
    topics: [
      topic("Personas"),
      topic("Relación con la comunidad"),
      topic("Rituales"),
      topic("Participación"),
      topic("Historias"),
    ],
  },
  ecosistema: {
    id: "ecosistema",
    title: "Ecosistema",
    topics: [
      topic("Plataformas"),
      topic("Productos vinculados"),
      topic("Partners"),
      topic("Extensiones de marca"),
      topic("Puntos de contacto"),
    ],
  },
  producto: {
    id: "producto",
    title: "Producto",
    topics: [
      topic("Arquitectura de producto"),
      topic("Plataformas"),
      topic("Capacidades"),
      topic("Líneas de producto"),
      topic("Ciclo de vida"),
    ],
  },
  experiencia: {
    id: "experiencia",
    title: "Experiencia",
    topics: [
      topic("Principios de experiencia"),
      topic("Journeys"),
      topic("Navegación"),
      topic("Momentos clave"),
      topic("Accesibilidad"),
    ],
  },
  "sistema-de-diseno": {
    id: "sistema-de-diseno",
    title: "Sistema de diseño",
    topics: [
      topic("Foundations"),
      topic("Componentes"),
      topic("Patrones"),
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
      topic("UX writing"),
      topic("Estándares editoriales"),
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
