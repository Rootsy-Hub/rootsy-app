/**
 * Voz de Rootsy en home: primera persona, vos, frases cortas.
 * Misma línea que `lib/auth/rootsyAuthUiCopy.ts`.
 */
export const HOME_COPY = {
  greeting: (name: string) => `Hola, ${name}.`,
  lead: "¿A qué negocio entramos?",
  footerLead: "Si querés, te dejo Rootsy en la compu. Entras más rápido.",
  download: "Descargar",
  editProfile: "Editar perfil",
  subscriptions: "Suscripciones",
  logOut: "Cerrar sesión",
  emptyPops:
    "No veo ningún punto de venta con acceso. Si te tenían que invitar, pedí que activen tu rol.",
  loadError: "No pude cargar tus puntos de venta.",
  retry: "¿Probamos de nuevo?",
  createPop: "Crear negocio",
  activateSubscription: "Activar suscripción",
  popTrial: "Prueba gratis",
  enteringPop: "Entrando",
  photoModalTitle: "Tu foto",
  photoModalClose: "Cerrar",
} as const
