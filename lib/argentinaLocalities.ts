export const ARGENTINA_COUNTRY_CODE = "AR"
export const ARGENTINA_COUNTRY_LABEL = "Argentina"

export type ArgentinaLocality = {
  name: string
  postalCode: string
}

export type ArgentinaProvince = {
  name: string
  localities: ArgentinaLocality[]
}

/** Provincias y localidades habituales con CPA de referencia (Argentina). */
export const ARGENTINA_PROVINCES: ArgentinaProvince[] = [
  {
    name: "Ciudad Autónoma de Buenos Aires",
    localities: [{ name: "Ciudad Autónoma de Buenos Aires", postalCode: "1000" }],
  },
  {
    name: "Buenos Aires",
    localities: [
      { name: "La Plata", postalCode: "1900" },
      { name: "Mar del Plata", postalCode: "7600" },
      { name: "Bahía Blanca", postalCode: "8000" },
      { name: "Tandil", postalCode: "7000" },
      { name: "Quilmes", postalCode: "1878" },
      { name: "San Isidro", postalCode: "1642" },
      { name: "Pilar", postalCode: "1629" },
      { name: "Morón", postalCode: "1708" },
    ],
  },
  {
    name: "Catamarca",
    localities: [
      { name: "San Fernando del Valle de Catamarca", postalCode: "4700" },
      { name: "Belén", postalCode: "4750" },
      { name: "Andalgalá", postalCode: "4740" },
    ],
  },
  {
    name: "Chaco",
    localities: [
      { name: "Resistencia", postalCode: "3500" },
      { name: "Presidencia Roque Sáenz Peña", postalCode: "3700" },
      { name: "Charata", postalCode: "3730" },
    ],
  },
  {
    name: "Chubut",
    localities: [
      { name: "Rawson", postalCode: "9103" },
      { name: "Comodoro Rivadavia", postalCode: "9000" },
      { name: "Trelew", postalCode: "9100" },
      { name: "Esquel", postalCode: "9200" },
    ],
  },
  {
    name: "Córdoba",
    localities: [
      { name: "Córdoba", postalCode: "5000" },
      { name: "Villa María", postalCode: "5900" },
      { name: "Río Cuarto", postalCode: "5800" },
      { name: "San Francisco", postalCode: "2400" },
    ],
  },
  {
    name: "Corrientes",
    localities: [
      { name: "Corrientes", postalCode: "3400" },
      { name: "Goya", postalCode: "3450" },
      { name: "Paso de los Libres", postalCode: "3230" },
    ],
  },
  {
    name: "Entre Ríos",
    localities: [
      { name: "Paraná", postalCode: "3100" },
      { name: "Concordia", postalCode: "3200" },
      { name: "Gualeguaychú", postalCode: "2820" },
    ],
  },
  {
    name: "Formosa",
    localities: [
      { name: "Formosa", postalCode: "3600" },
      { name: "Clorinda", postalCode: "3610" },
      { name: "Pirané", postalCode: "3606" },
      { name: "Las Lomitas", postalCode: "3630" },
      { name: "Ibarreta", postalCode: "3624" },
    ],
  },
  {
    name: "Jujuy",
    localities: [
      { name: "San Salvador de Jujuy", postalCode: "4600" },
      { name: "Palpalá", postalCode: "4612" },
      { name: "Libertador General San Martín", postalCode: "4512" },
    ],
  },
  {
    name: "La Pampa",
    localities: [
      { name: "Santa Rosa", postalCode: "6300" },
      { name: "General Pico", postalCode: "6360" },
    ],
  },
  {
    name: "La Rioja",
    localities: [
      { name: "La Rioja", postalCode: "5300" },
      { name: "Chilecito", postalCode: "5360" },
    ],
  },
  {
    name: "Mendoza",
    localities: [
      { name: "Mendoza", postalCode: "5500" },
      { name: "San Rafael", postalCode: "5600" },
      { name: "San Martín", postalCode: "5570" },
    ],
  },
  {
    name: "Misiones",
    localities: [
      { name: "Posadas", postalCode: "3300" },
      { name: "Oberá", postalCode: "3360" },
      { name: "Eldorado", postalCode: "3380" },
    ],
  },
  {
    name: "Neuquén",
    localities: [
      { name: "Neuquén", postalCode: "8300" },
      { name: "San Martín de los Andes", postalCode: "8370" },
      { name: "Cutral Có", postalCode: "8322" },
    ],
  },
  {
    name: "Río Negro",
    localities: [
      { name: "Viedma", postalCode: "8500" },
      { name: "San Carlos de Bariloche", postalCode: "8400" },
      { name: "General Roca", postalCode: "8332" },
    ],
  },
  {
    name: "Salta",
    localities: [
      { name: "Salta", postalCode: "4400" },
      { name: "Tartagal", postalCode: "4560" },
      { name: "Orán", postalCode: "4530" },
    ],
  },
  {
    name: "San Juan",
    localities: [
      { name: "San Juan", postalCode: "5400" },
      { name: "Rawson", postalCode: "5425" },
      { name: "Chimbas", postalCode: "5413" },
    ],
  },
  {
    name: "San Luis",
    localities: [
      { name: "San Luis", postalCode: "5700" },
      { name: "Villa Mercedes", postalCode: "5730" },
    ],
  },
  {
    name: "Santa Cruz",
    localities: [
      { name: "Río Gallegos", postalCode: "9400" },
      { name: "Caleta Olivia", postalCode: "9011" },
      { name: "El Calafate", postalCode: "9405" },
    ],
  },
  {
    name: "Santa Fe",
    localities: [
      { name: "Santa Fe", postalCode: "3000" },
      { name: "Rosario", postalCode: "2000" },
      { name: "Rafaela", postalCode: "2300" },
      { name: "Venado Tuerto", postalCode: "2600" },
    ],
  },
  {
    name: "Santiago del Estero",
    localities: [
      { name: "Santiago del Estero", postalCode: "4200" },
      { name: "La Banda", postalCode: "4300" },
      { name: "Termas de Río Hondo", postalCode: "4220" },
    ],
  },
  {
    name: "Tierra del Fuego",
    localities: [
      { name: "Ushuaia", postalCode: "9410" },
      { name: "Río Grande", postalCode: "9420" },
    ],
  },
  {
    name: "Tucumán",
    localities: [
      { name: "San Miguel de Tucumán", postalCode: "4000" },
      { name: "Yerba Buena", postalCode: "4107" },
      { name: "Concepción", postalCode: "4146" },
    ],
  },
]

function normalizeGeoLabel(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
}

export function findArgentinaProvince(
  state: string | null | undefined,
): ArgentinaProvince | null {
  const needle = normalizeGeoLabel(state ?? "")
  if (!needle) return null
  return (
    ARGENTINA_PROVINCES.find(
      (province) => normalizeGeoLabel(province.name) === needle,
    ) ??
    ARGENTINA_PROVINCES.find((province) =>
      normalizeGeoLabel(province.name).includes(needle),
    ) ??
    null
  )
}

export function listArgentinaLocalities(
  state: string | null | undefined,
  currentCity?: string | null,
  currentPostalCode?: string | null,
): ArgentinaLocality[] {
  const province = findArgentinaProvince(state)
  const base = province?.localities ?? []
  const city = currentCity?.trim()
  if (!city) return base
  if (base.some((item) => normalizeGeoLabel(item.name) === normalizeGeoLabel(city))) {
    return base
  }
  return [{ name: city, postalCode: currentPostalCode?.trim() ?? "" }, ...base]
}

export function findArgentinaLocality(
  state: string | null | undefined,
  city: string | null | undefined,
): ArgentinaLocality | null {
  const province = findArgentinaProvince(state)
  if (!province) return null
  const needle = normalizeGeoLabel(city ?? "")
  if (!needle) return null
  return (
    province.localities.find(
      (item) => normalizeGeoLabel(item.name) === needle,
    ) ?? null
  )
}

export function resolveArgentinaCountryCode(country: string | null | undefined): string {
  const normalized = normalizeGeoLabel(country ?? "")
  if (!normalized || normalized === "ar" || normalized.includes("argentina")) {
    return ARGENTINA_COUNTRY_CODE
  }
  return country?.trim() ?? ARGENTINA_COUNTRY_CODE
}
