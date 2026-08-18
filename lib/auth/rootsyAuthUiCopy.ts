import { ROOTSY_BRAND_SLOGAN } from "@/lib/rootsyBrand"

/**
 * Voz de Rootsy en pantallas de auth y alta.
 * Misma línea que `lib/email/rootsyEmailVoice.ts`: primera persona, vos, cercana.
 */
export const AUTH_SHELL_COPY = {
  asideWorldLine: "Un ecosistema vivo",
  asideTitle: ROOTSY_BRAND_SLOGAN,
  asideLead:
    "Entre valle, cielo y datos claros — ventas, stock y el día a día en un mismo paisaje.",
  /** @deprecated Usar asideWorldLine */
  asideEyebrow: "Un ecosistema vivo",
} as const

export const LOGIN_COPY = {
  eyebrow: "De nuevo acá",
  title: "Ingresá a tu cuenta",
  leadBeforeLink: "¿Todavía no tenés cuenta?",
  registerLink: "Creá una",
  forgotPasswordLink: "Olvidé mi contraseña",
  submit: "Ingresar",
  submitLoading: "Ingresando…",
  google: "Continuar con Google",
  errors: {
    callback: "No pude completar el ingreso. ¿Probamos de nuevo?",
    unconfirmed:
      "Esta cuenta todavía no confirmó el correo. Te puedo mandar otro mail.",
    wrongPasswordConfirmed:
      "La contraseña no coincide con este correo.",
    invalidCredentials: "No encontré esa combinación de correo y contraseña.",
    generic: "No pude iniciar sesión. ¿Probamos de nuevo?",
    google: "No pude continuar con Google.",
    passwordRequired: "Necesito tu contraseña",
  },
} as const

export const REGISTER_COPY = {
  title: "Creá tu cuenta",
  leadBeforeLink: "¿Ya tenés cuenta?",
  loginLink: "Ingresá",
  submit: "Continuar",
  submitLoading: "Creando cuenta…",
  google: "Continuar con Google",
  successNew:
    "Te mandé un mail para confirmar. Si no te llega, mirá spam o pedime reenviarlo.",
  successResent:
    "Este correo ya tenía una cuenta pendiente. Te mandé otro mail para confirmarla.",
  errors: {
    alreadyRegistered: "Este correo ya está registrado. ¿Ingresamos?",
    createFailed: "No pude crear la cuenta. ¿Probamos de nuevo?",
    google: "No pude continuar con Google.",
    termsRequired: "Necesito que aceptes los términos para seguir.",
  },
} as const

export const RECOVERY_COPY = {
  eyebrow: "Contraseña",
  requestTitle: "¿Olvidaste tu contraseña?",
  requestLead:
    "Dejame tu correo y te mando un enlace para elegir una contraseña nueva.",
  emailSentTitle: "Revisá tu correo",
  emailSentLead:
    "Si el correo está registrado, te mandé un enlace para restablecer la contraseña. Con eso elegís una clave nueva acá.",
  verifyingTitle: "Verificando…",
  verifyingLead: "Estoy validando el enlace.",
  verifyingSpinner: "Verificando el enlace",
  fatalTitle: "No pude continuar",
  fatalInvalidLink:
    "Este enlace no sirve o ya expiró. Pedime uno nuevo.",
  fatalNoSession:
    "No encontré una sesión activa. Pedime un link nuevo desde acá.",
  newPasswordTitle: "Elegí una contraseña nueva",
  passwordUpdated:
    "Listo, contraseña actualizada. Te llevo al ingreso…",
  submitRequest: "Mandame el enlace",
  submitRequestLoading: "Enviando…",
  submitUpdate: "Actualizar contraseña",
  submitUpdateLoading: "Guardando…",
  backToLogin: "Volver al ingreso",
  retryLink: "Pedir otro enlace",
  errors: {
    sendFailed: "No pude enviar el mail. ¿Probamos de nuevo?",
    updateFailed: "No pude actualizar la contraseña.",
  },
} as const

export const POP_CREATE_COPY = {
  asideEyebrowTrial: (days: number) => `${days} días para recorrer el planeta`,
  asideEyebrowPaid: "Próximo paso en el valle",
  asideTitle: "Plantemos tu negocio",
  asideLeadTrial:
    "Guardá una tarjeta y empezamos. Hoy no se cobra nada — solo abrimos tu espacio en el ecosistema.",
  asideLeadPaid:
    "Activamos el plan que elegiste. Tu negocio queda plantado acá con el primer cobro al crear.",
  eyebrowTrial: "Prueba gratis",
  eyebrowPaid: "Plan pago",
  title: "Creá tu negocio",
  lead:
    "Contame cómo cobrás la mayor parte del día. Si tenés más de un rubro, lo sumamos después.",
  backHome: "Volver al inicio",
  loadingConfig: "Estoy cargando la configuración…",
  loadingPlans: "Estoy cargando los planes…",
  noPlans: "No encontré planes para este rubro.",
  popNameHint:
    "Así lo vas a ver en el menú. CUIT y facturación van después, en ajustes.",
  trialChargeNote: (firstChargeLabel: string, price: string, period: string) =>
    `Hoy $0. El ${firstChargeLabel} debito ${price}/${period}. Cancelás cuando quieras.`,
  paidChargeNote: (price: string, period: string) =>
    `Se cobra ${price}/${period} al activar el negocio.`,
  cardHintTrial:
    "Guardamos la tarjeta con Mercado Pago para el cobro al final de la prueba. Hoy $0.",
  cardHintPaid: "Se cobra el primer período al confirmar la creación.",
  submitTrial: (days: number) => `Empezar ${days} días de prueba`,
  submitActivate: (price: string) => `Activar y pagar ${price}`,
  submitCreate: "Crear negocio",
  submitLoading: "Procesando…",
  errors: {
    popNameRequired: "Necesito el nombre del negocio",
    popNameMin: "Usá al menos 3 caracteres",
    popNameMax: "Máximo 100 caracteres",
    businessTypeRequired: "Contame cómo cobrás la mayor parte del día",
    planRequired: "Elegí un plan",
    mercadoPagoNotConfigured: "Mercado Pago no está configurado en este entorno.",
    cardIncomplete: "Completá los datos de la tarjeta",
    unexpected: "No pude crear el negocio. ¿Probamos de nuevo?",
  },
} as const

export const AUTH_RESEND_COPY = {
  resend: "Reenviar mail",
  resending: "Reenviando…",
  resent: "Listo, te lo reenvié",
} as const
