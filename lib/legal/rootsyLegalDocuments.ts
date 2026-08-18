export type LegalDocId = "terms" | "privacy"

export type LegalSection = {
  title: string
  paragraphs: string[]
}

export type LegalDocument = {
  id: LegalDocId
  title: string
  description: string
  updatedAt: string
  version: string
  sections: LegalSection[]
}

export const ROOTSY_LEGAL_UPDATED_AT = "18 de agosto de 2026"
export const ROOTSY_LEGAL_VERSION = "1.0"
export const ROOTSY_LEGAL_CONTACT =
  "el canal de soporte publicado en el Sitio o el correo indicado en el comprobante de suscripción"

const TERMS: LegalDocument = {
  id: "terms",
  title: "Términos y condiciones",
  description: "Contrato de uso del software de gestión Rootsy.",
  updatedAt: ROOTSY_LEGAL_UPDATED_AT,
  version: ROOTSY_LEGAL_VERSION,
  sections: [
    {
      title: "1. Identificación y aceptación",
      paragraphs: [
        "Estos Términos y Condiciones (los «Términos») regulan el acceso y uso de la plataforma Rootsy, marca comercial del prestador del servicio de software de gestión en la nube (en adelante, «Rootsy», «nosotros» o el «Prestador»), disponible en el sitio web y aplicaciones asociadas (el «Sitio»).",
        "Al crear una cuenta, tildar la casilla de aceptación, iniciar sesión o usar el Servicio, el Usuario declara haber leído, comprendido y aceptado estos Términos y la Política de privacidad. Si no está de acuerdo, no debe registrarse ni utilizar Rootsy.",
        "El Prestador se identifica fiscalmente en la factura o comprobante de la suscripción. Los datos de contacto vigentes se publican en el Sitio. Cualquier duda sobre estos Términos puede canalizarse por " +
          ROOTSY_LEGAL_CONTACT +
          ".",
      ],
    },
    {
      title: "2. Definiciones",
      paragraphs: [
        "«Servicio»: el software como servicio (SaaS) de gestión comercial y operativa que Rootsy pone a disposición, incluyendo módulos de ventas, compras, stock, artículos, recetas, clientes, proveedores, caja, tesorería, cuentas corrientes, cheques, presupuestos, órdenes de compra, facturación, reportes, recursos humanos y configuraciones, según el plan contratado.",
        "«Usuario»: la persona física que crea o accede a una cuenta. «Titular»: quien contrata el Servicio y es responsable del o los negocios. «Negocio»: el espacio de trabajo (comercio, restaurant, fábrica u otro rubro habilitado) donde se cargan y operan los datos del Titular.",
        "«Contenido del Cliente»: toda información que el Usuario o sus colaboradores cargan o generan en el negocio (catálogo, precios, stock, operaciones, clientes, proveedores, comprobantes, configuraciones, archivos e integraciones).",
        "«Plan»: la suscripción Starter, Professional, Enterprise u otra vigente, con ciclo mensual o anual, límites y módulos publicados en el Sitio al momento de la contratación.",
      ],
    },
    {
      title: "3. Capacidad y representación",
      paragraphs: [
        "El Servicio está destinado a comercios, profesionales y organizaciones. El Usuario declara ser mayor de 18 años y tener capacidad legal para contratar.",
        "Si actúa en nombre de una sociedad, monotributista, responsable inscripto u otro sujeto, declara contar con facultades suficientes para obligarlo. El Titular es responsable de las acciones de todos los usuarios que invite al negocio (empleados, encargados, contadores u otros roles).",
        "Rootsy puede solicitar documentación razonable para verificar identidad, CUIT o facultades cuando exista riesgo de fraude, incumplimiento o requerimiento de un medio de pago o autoridad competente.",
      ],
    },
    {
      title: "4. Descripción del Servicio",
      paragraphs: [
        "Rootsy es una herramienta informática para administrar el día a día del negocio: vender, comprar, controlar stock, emitir o preparar comprobantes, registrar caja y cuentas, y consultar reportes. El alcance exacto depende del rubro, el plan y los módulos activos.",
        "Rootsy no es un estudio contable, jurídico ni impositivo, ni reemplaza al contador, al asesor fiscal ni a los sistemas de la AFIP/ARCA. Las decisiones comerciales, de precios, de stock y de cumplimiento tributario son exclusiva responsabilidad del Titular.",
        "Funcionalidades, límites, integraciones y precios pueden evolucionar. Los cambios sustanciales de plan se comunicarán por el Sitio, la cuenta o el correo registrado, con la antelación razonable que permita la operación del Servicio.",
      ],
    },
    {
      title: "5. Cuenta, negocio y prueba",
      paragraphs: [
        "Para usar el Servicio hay que crear una cuenta con correo y contraseña, o mediante un proveedor de identidad (por ejemplo Google). El Usuario es responsable de la confidencialidad de sus credenciales y de toda actividad realizada con su cuenta.",
        "Tras el registro, el Titular puede crear uno o más negocios, indicar rubro, plan y, cuando corresponda, un medio de pago. Rootsy puede ofrecer un período de prueba (por ejemplo siete días) sujeto a que se registre una tarjeta u otro medio habilitado. La prueba no implica que el Servicio sea gratuito de forma indefinida.",
        "El Usuario se obliga a proporcionar datos veraces y a mantenerlos actualizados. Rootsy puede rechazar, suspender o cancelar altas que resulten fraudulentas, duplicadas o contrarias a estos Términos.",
      ],
    },
    {
      title: "6. Planes, pagos y facturación de la suscripción",
      paragraphs: [
        "El uso del Servicio, vencida la prueba o desde el alta paga, está sujeto al Plan contratado y a los precios publicados o acordados (incluido Enterprise). Los importes se expresan en la moneda indicada en el Sitio e incluyen o discriminan impuestos según se informe en el checkout y en el comprobante.",
        "Los cobros de suscripción se procesan a través de Mercado Pago u otro procesador que Rootsy habilite. Rootsy no almacena el número completo de la tarjeta: los datos de pago se tokenizan en el procesador. El Titular autoriza los débitos recurrentes del ciclo elegido (mensual o anual) hasta la baja.",
        "La falta de pago, el rechazo de la tarjeta, el chargeback o la mora autorizan a Rootsy a restringir módulos, pasar el negocio a modo de solo lectura o suspender el acceso, sin perjuicio de reclamar saldos e intereses si correspondieran. La reactivación puede exigir regularizar la deuda.",
        "Salvo norma imperativa en contrario, las suscripciones no son reembolsables por períodos ya iniciados. El Titular puede dar de baja para que no se renueve el ciclo siguiente, con los efectos que se indiquen en la cuenta o en el soporte.",
      ],
    },
    {
      title: "7. Obligaciones del Usuario",
      paragraphs: [
        "Usar el Servicio conforme a la ley argentina, estos Términos y la documentación del Sitio; no eludir límites del Plan ni mecanismos de seguridad.",
        "Cargar y conservar la información fiscal del negocio (CUIT, razón social, punto de venta AFIP, condición IVA y demás datos exigidos por la normativa) cuando utilice facturación u otras funciones vinculadas a organismos públicos.",
        "Respetar derechos de terceros (marcas, imágenes, datos de clientes y proveedores). Obtener los consentimientos o bases legales que correspondan para tratar datos de sus propios clientes, empleados y proveedores dentro del negocio.",
        "Realizar copias de resguardo periódicas de la información crítica mediante las exportaciones o reportes que el Servicio habilite. Rootsy ejecuta resguardos técnicos propios, pero no sustituye la política de backup del Titular.",
      ],
    },
    {
      title: "8. Usos prohibidos",
      paragraphs: [
        "Queda prohibido: (a) usar el Servicio para actividades ilícitas, evasión fiscal, lavado de activos o fraude; (b) intentar acceder a negocios ajenos, vulnerar la seguridad o realizar ingeniería inversa no autorizada; (c) sobrecargar la infraestructura de forma artificial; (d) revender el Servicio sin autorización; (e) introducir malware; (f) usar marcas de Rootsy de modo que genere confusión; (g) registrar datos falsos de medios de pago.",
        "Rootsy puede suspender de inmediato el acceso ante indicios razonables de estas conductas, y denunciarlas a autoridades o al procesador de pagos cuando corresponda.",
      ],
    },
    {
      title: "9. Contenido del Cliente y propiedad intelectual",
      paragraphs: [
        "El Contenido del Cliente es del Titular o de quien corresponda según su relación comercial. Rootsy no reclama titularidad sobre catálogo, operaciones ni padrones que el Usuario cargue. El Titular otorga a Rootsy una licencia limitada, no exclusiva y revocable para alojar, procesar y mostrar ese contenido solo con el fin de prestar, asegurar y mejorar el Servicio.",
        "El software, el diseño, las marcas, los textos de interfaz, la librería visual y demás elementos de Rootsy son propiedad del Prestador o de sus licenciantes. El Usuario recibe una licencia de uso onerosa, intransferible y no exclusiva, limitada al Plan vigente, sin derecho a copiar, modificar o explotar el software fuera del Servicio.",
      ],
    },
    {
      title: "10. Facturación electrónica y organismos públicos",
      paragraphs: [
        "Cuando el negocio emite o prueba comprobantes electrónicos (incluidas integraciones con AFIP/ARCA, padrón de contribuyentes, CAE u homologación), Rootsy actúa exclusivamente como herramienta tecnológica. El contribuyente responsable ante el fisco es el Titular del negocio.",
        "El Usuario es el único responsable de la veracidad de CUIT, puntos de venta AFIP, alícuotas, tipos de comprobante, receptor, importes y de la conservación de comprobantes que exija la normativa. Un error de carga, un certificado vencido, una falla de AFIP o un ambiente de homologación no desplazan esa responsabilidad.",
        "Rootsy no garantiza que AFIP/ARCA, ni ningún organismo, estén disponibles en todo momento, ni que un comprobante sea aceptado. El Usuario debe verificar el resultado de cada emisión (CAE, rechazos, observaciones) antes de considerarlo válido.",
      ],
    },
    {
      title: "11. Integraciones de terceros",
      paragraphs: [
        "El Servicio puede conectarse con Mercado Pago (cobro de la suscripción Rootsy y, si el Titular lo habilita, la cuenta comercial del negocio), Google (inicio de sesión), proveedores de correo, infraestructura en la nube y organismos públicos.",
        "Esas prestaciones se rigen además por los términos y políticas de cada tercero. Rootsy no controla su disponibilidad, cambios de API ni incidentes. Un corte o cambio de un tercero no genera por sí indemnización a cargo de Rootsy, sin perjuicio de que procure alternativas razonables.",
        "Al vincular una cuenta de Mercado Pago del comercio, el Titular declara ser titular o estar autorizado a operar esa cuenta y acepta que Rootsy trate los tokens y datos estrictamente necesarios para la integración.",
      ],
    },
    {
      title: "12. Disponibilidad, soporte y modificaciones",
      paragraphs: [
        "Rootsy procura una disponibilidad razonable del Servicio y ventanas de mantenimiento comunicadas cuando sea posible. No se promete un 100 % de uptime. Pueden existir errores, demoras o interrupciones por causas técnicas, de fuerza mayor, de terceros o de conectividad del Usuario.",
        "El soporte se brinda por los canales publicados, en días y horarios que Rootsy informe, sin perjuicio de planes con atención reforzada.",
        "Rootsy puede actualizar el software, corregir errores y cambiar interfaces. Si una modificación elimina de forma material una funcionalidad esencial del Plan vigente, se informará con antelación razonable o se ofrecerá una alternativa, la migración o la baja sin penalidad del ciclo no usado, según el caso.",
      ],
    },
    {
      title: "13. Datos personales",
      paragraphs: [
        "El tratamiento de datos personales del Usuario y de los datos que este cargue sobre terceros se rige por la Política de privacidad y por la Ley 25.326 y normas complementarias. El Titular es, respecto de los datos de sus clientes, empleados y proveedores, el responsable del tratamiento; Rootsy actúa como encargado en la medida en que trata esos datos por instrucción del Titular para prestar el Servicio.",
      ],
    },
    {
      title: "14. Garantías y limitación de responsabilidad",
      paragraphs: [
        "El Servicio se presta «en el estado en que se encuentra» y «según disponibilidad». En la medida máxima permitida por el derecho argentino, Rootsy no garantiza resultados comerciales, imposibilidad de errores ni adecuación a un propósito particular no informado.",
        "Rootsy no responde por lucro cesante, pérdida de chance, daño indirecto, pérdida de datos derivada de omisión de backups del Titular, decisiones tomadas con base en reportes, ni por sanciones fiscales, laborales o comerciales originadas en el uso que el Titular haga del Servicio.",
        "Salvo dolo o culpa grave, y salvo derechos irrenunciables del consumidor cuando resulten aplicables (Ley 24.240 y normas concordantes), la responsabilidad total de Rootsy por reclamos vinculados al Servicio en un período de doce meses queda limitada al monto efectivamente pagado por el Titular a Rootsy por el Plan en esos doce meses.",
        "Nada de lo anterior limita la responsabilidad que la ley impide exonerar, ni los derechos de quienes califiquen como consumidores o usuarios en los términos de la normativa de defensa del consumidor.",
      ],
    },
    {
      title: "15. Indemnidad",
      paragraphs: [
        "El Titular mantiene indemne a Rootsy, sus colaboradores y proveedores frente a reclamos de terceros derivados del Contenido del Cliente, del uso del negocio, de comprobantes emitidos, de infracciones a derechos de terceros o de incumplimientos legales del Titular, incluyendo costas y honorarios razonables, salvo que el reclamo se origine en un incumplimiento imputable a Rootsy.",
      ],
    },
    {
      title: "16. Plazo, suspensión y baja",
      paragraphs: [
        "El contrato rige desde la aceptación y mientras exista una cuenta activa o un Plan vigente. El Usuario puede solicitar la baja por los canales de soporte. Rootsy puede dar de baja por incumplimiento grave, falta de pago, fraude o requerimiento legal.",
        "Tras la baja, Rootsy puede conservar datos el tiempo exigido por ley (por ejemplo, obligaciones contables o de prevención de fraude) y luego eliminarlos o anonimizarlos. Es responsabilidad del Titular exportar su información antes de la baja definitiva.",
      ],
    },
    {
      title: "17. Cesión y terceros",
      paragraphs: [
        "El Usuario no puede ceder el contrato sin consentimiento escrito de Rootsy. Rootsy puede cederlo a una sociedad del mismo grupo, o en el marco de una reorganización, fusión o venta de unidad de negocio, notificando cuando corresponda.",
      ],
    },
    {
      title: "18. Modificaciones de estos Términos",
      paragraphs: [
        "Rootsy puede actualizar estos Términos. La versión vigente se publica en el Sitio con fecha y número de versión. Si el cambio es sustancial, se avisará por correo o mediante aviso en el Servicio. El uso continuado después de la entrada en vigencia implica aceptación, sin perjuicio del derecho a dar de baja el Plan si el Usuario no acepta el cambio.",
      ],
    },
    {
      title: "19. Ley aplicable y jurisdicción",
      paragraphs: [
        "Estos Términos se rigen por las leyes de la República Argentina.",
        "Toda controversia se somete a los tribunales ordinarios competentes de la Ciudad Autónoma de Buenos Aires, salvo que una norma de orden público (en especial, defensa del consumidor) atribuya otra competencia a favor del Usuario. En ese caso, prevalece la norma imperativa.",
      ],
    },
    {
      title: "20. Disposiciones generales",
      paragraphs: [
        "Si alguna cláusula se declara inválida, las restantes siguen vigentes. El silencio o la demora en ejercer un derecho no implica renuncia. Estos Términos, la Política de privacidad, el Plan contratado y los avisos operativos del Sitio constituyen el acuerdo completo respecto del Servicio, y reemplazan entendimientos previos sobre el mismo objeto.",
        "Versión " +
          ROOTSY_LEGAL_VERSION +
          ". Última actualización: " +
          ROOTSY_LEGAL_UPDATED_AT +
          ".",
      ],
    },
  ],
}

const PRIVACY: LegalDocument = {
  id: "privacy",
  title: "Política de privacidad",
  description: "Cómo Rootsy trata datos personales según la Ley 25.326.",
  updatedAt: ROOTSY_LEGAL_UPDATED_AT,
  version: ROOTSY_LEGAL_VERSION,
  sections: [
    {
      title: "1. Responsable y alcance",
      paragraphs: [
        "Esta Política describe cómo Rootsy trata datos personales de usuarios de la cuenta (Titulares y colaboradores) y, como encargado, los datos que esos usuarios cargan en el negocio sobre clientes, proveedores, empleados y otros terceros.",
        "El tratamiento se rige por la Ley 25.326 de Protección de Datos Personales, su decreto reglamentario, las disposiciones de la Agencia de Acceso a la Información Pública (AAIP) y, cuando corresponda, normas de defensa del consumidor y de firma digital.",
        "El responsable del tratamiento de los datos de la cuenta y de la suscripción es el Prestador de Rootsy. Respecto de los padrones y operaciones del negocio (clientes del comercio, empleados del negocio, etc.), el responsable es el Titular del negocio; Rootsy trata esos datos siguiendo sus instrucciones para operar el software.",
      ],
    },
    {
      title: "2. Datos que recolectamos",
      paragraphs: [
        "Cuenta: correo electrónico, contraseña (almacenada de forma irreversible), nombre derivado o el que el Usuario complete después, identificadores de inicio de sesión con Google si se elige esa vía, e IP y registros técnicos de acceso.",
        "Suscripción y cobro: plan, ciclo, estado de prueba, identificadores de pago y tokens que entrega Mercado Pago. No guardamos el número completo de la tarjeta ni el código de seguridad.",
        "Negocio y operación: nombre del negocio, rubro, configuraciones, catálogo, stock, recetas, clientes y proveedores (incluido CUIT/DNI cuando el Usuario lo carga o consulta en padrones), comprobantes, caja, tesorería, usuarios internos y permisos, archivos e imágenes que se suban.",
        "Comunicaciones: mensajes al soporte, correos transaccionales (alta, recupero de clave, avisos de cobro) y, si el Usuario lo acepta, novedades del producto.",
        "Datos obtenidos de terceros: AFIP/ARCA u otros padrones cuando el Usuario dispara una consulta; perfil básico de Google si se usa ese inicio de sesión; resultado de cobros de Mercado Pago.",
      ],
    },
    {
      title: "3. Finalidades y bases",
      paragraphs: [
        "Ejecución contractual: crear y autenticar la cuenta, prestar el Servicio, cobrar la suscripción, dar soporte y permitir integraciones que el Titular active.",
        "Obligación legal: emitir o conservar comprobantes de la suscripción, atender requerimientos de autoridad competente con orden válida, y cumplir normas de protección de datos.",
        "Interés legítimo (ponderado y no invasivo): seguridad, prevención de fraude, mejora de rendimiento y estadísticas agregadas o seudonimizadas del producto.",
        "Consentimiento: envíos de marketing, cuando se solicite de forma específica, y cookies no esenciales si se implementan en el futuro con un banner de preferencias.",
        "No usamos los datos del negocio para vender listas a terceros ni para entrenar modelos de IA de terceros con contenido identificable del Cliente, salvo instrucción expresa del Titular o anonimización previa.",
      ],
    },
    {
      title: "4. Destinatarios y encargados",
      paragraphs: [
        "Infraestructura y base de datos (hoy, servicios de nube del tipo de los utilizados para autenticación y almacenamiento, p. ej. el proveedor de backend de la aplicación).",
        "Correo transaccional (proveedor de envío de emails).",
        "Mercado Pago, para el cobro de la suscripción y, si se vincula, para la cuenta comercial del negocio.",
        "Google, solo si el Usuario elige «Continuar con Google».",
        "AFIP/ARCA u organismos, cuando el Usuario utiliza padrones o facturación electrónica: la consulta la dispara el Titular y los datos viajan hacia esos sistemas oficiales.",
        "Asesores profesionales (legales, contables) bajo deber de confidencialidad, y autoridades cuando exista obligación legal.",
        "Estos encargados tratan datos según contratos o términos que exigen confidencialidad y uso limitado a la prestación. Algunos pueden estar fuera de Argentina: en ese caso Rootsy adopta salvaguardas razonables (cláusulas contractuales, medidas de seguridad y minimización).",
      ],
    },
    {
      title: "5. Conservación",
      paragraphs: [
        "Los datos de cuenta y facturación se conservan mientras la cuenta esté activa y, después, el plazo que impongan normas contables, fiscales o de defensa del consumidor, o el necesario para formular o defender reclamos.",
        "El Contenido del Cliente se conserva mientras el negocio exista. Tras la baja, Rootsy puede retener copias de seguridad por un período técnico limitado y luego eliminar o anonimizar, salvo retención legal. El Titular debe exportar antes de solicitar el borrado definitivo cuando lo necesite para su propio cumplimiento.",
      ],
    },
    {
      title: "6. Derechos de las personas (Ley 25.326)",
      paragraphs: [
        "El titular de los datos puede solicitar acceso, rectificación, actualización o supresión, y preguntar si se trata información que lo identifique, en los términos de los arts. 14 y siguientes de la Ley 25.326.",
        "Las solicitudes relativas a la cuenta Rootsy se canalizan por " +
          ROOTSY_LEGAL_CONTACT +
          ". Las relativas a clientes o empleados cargados en un negocio deben dirigirse primero al Titular de ese negocio, que es el responsable de esos tratamientos; Rootsy colaborará con el Titular para atender el derecho cuando corresponda.",
        "El titular de los datos puede presentar un reclamo ante la Agencia de Acceso a la Información Pública (AAIP), órgano de control de la Ley 25.326, a través de los canales oficiales de esa Agencia.",
        "La supresión no procede cuando exista un deber legal de conservar el dato o cuando sea necesario para el cumplimiento del contrato o la formulación de un reclamo.",
      ],
    },
    {
      title: "7. Seguridad",
      paragraphs: [
        "Rootsy aplica medidas técnicas y organizativas razonables: cifrado en tránsito, control de acceso por cuenta y roles de negocio, hashing de contraseñas, y separación lógica entre negocios. Ningún sistema es infalible: el Usuario también debe usar contraseñas robustas, no compartirlas y cerrar sesión en dispositivos compartidos.",
        "Ante un incidente de seguridad que afecte datos personales de forma relevante, Rootsy evaluará y, cuando corresponda, informará a los afectados y a la autoridad según la normativa aplicable.",
      ],
    },
    {
      title: "8. Cookies y almacenamiento local",
      paragraphs: [
        "Usamos cookies o almacenamiento estrictamente necesarios para la sesión de autenticación, la seguridad y recordar la intención de alta (plan, ciclo y rubro elegidos) durante el registro. Sin esos elementos el Servicio no puede funcionar.",
        "No instalamos cookies publicitarias de terceros en el flujo de login y registro. Si en el futuro se usan cookies de analítica o marketing, se informará y, cuando la norma lo exija, se recabará preferencia.",
      ],
    },
    {
      title: "9. Menores",
      paragraphs: [
        "El Servicio no está dirigido a menores de 18 años. Si tomamos conocimiento de una cuenta creada por un menor sin autorización, la deshabilitaremos y eliminaremos los datos que no debamos conservar por ley.",
      ],
    },
    {
      title: "10. Transferencias y cambios de proveedor",
      paragraphs: [
        "Los proveedores de infraestructura pueden cambiar por razones operativas. Rootsy procurará un nivel de protección no inferior al descrito. Un cambio sustancial de destino de los datos se reflejará en esta Política y, si corresponde, se comunicará al Usuario.",
      ],
    },
    {
      title: "11. Actualizaciones",
      paragraphs: [
        "Esta Política puede actualizarse. La versión vigente se publica con fecha. El uso continuado del Servicio después de un cambio sustancial, debidamente informado, implica conocimiento de la nueva versión, sin perjuicio de los derechos que la Ley 25.326 otorga y no permite renunciar.",
        "Versión " +
          ROOTSY_LEGAL_VERSION +
          ". Última actualización: " +
          ROOTSY_LEGAL_UPDATED_AT +
          ".",
      ],
    },
  ],
}

export const ROOTSY_LEGAL_DOCUMENTS: Record<LegalDocId, LegalDocument> = {
  terms: TERMS,
  privacy: PRIVACY,
}

export function getLegalDocument(id: LegalDocId): LegalDocument {
  return ROOTSY_LEGAL_DOCUMENTS[id]
}
