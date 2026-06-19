"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const ITEMS = [
  {
    id: "que-es",
    pregunta: "¿Qué es Rootsy, en pocas palabras?",
    respuesta:
      "Es un sistema para administrar tu negocio en un solo lugar: ventas, stock, compras, caja y reportes. Pensado para que el día a día sea más ordenado, sin depender de mil planillas sueltas.",
  },
  {
    id: "rubro",
    pregunta: "¿Sirve para mi rubro o solo para algunos?",
    respuesta:
      "Rootsy se adapta a comercios, gastronomía, fabricación, servicios profesionales y negocios con reservas o turnos. Configurás lo que usás (productos, mesas, producción, agenda, etc.) según tu rubro.",
  },
  {
    id: "instalacion",
    pregunta: "¿Tengo que instalar algo en la computadora?",
    respuesta:
      "No hace falta instalar un programa clásico: accedés desde el navegador y también podés usarlo en el celular cuando estés en movimiento.",
  },
  {
    id: "prueba",
    pregunta: "¿Puedo probar antes de comprometerme?",
    respuesta:
      "Sí: al registrarte podés crear tu punto de venta y usar Rootsy 7 días gratis, sin tarjeta. Después elegís el plan que mejor se adapte a tu negocio.",
  },
  {
    id: "datos",
    pregunta: "¿Dónde quedan mis datos?",
    respuesta:
      "Tus datos se alojan en infraestructura pensada para aplicaciones web actuales, con buenas prácticas de acceso y respaldo. Si necesitás documentación formal para tu empresa, se puede complementar con el canal de soporte.",
  },
  {
    id: "migrar",
    pregunta: "¿Puedo migrar desde Excel u otro sistema?",
    respuesta:
      "Sí, muchos equipos empiezan con información en planillas o en herramientas anteriores. La migración depende de qué tengas hoy; lo importante es ordenar productos, clientes y stock de forma que el cambio sea progresivo y controlado.",
  },
] as const

export function PreguntasAnticipadasSection() {
  return (
    <div id="faq">
      <div className="rounded-2xl border border-rootsy-hairline bg-card/45 px-1 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] sm:px-2">
        <Accordion type="single" collapsible className="w-full px-3 sm:px-5">
          {ITEMS.map((item) => (
            <AccordionItem
              key={item.id}
              value={item.id}
              className="border-rootsy-hairline"
            >
              <AccordionTrigger className="py-5 text-left text-base font-semibold text-foreground hover:no-underline sm:text-[1.05rem]">
                {item.pregunta}
              </AccordionTrigger>
              <AccordionContent className="text-pretty text-[0.9375rem] leading-relaxed text-muted-foreground">
                {item.respuesta}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  )
}
