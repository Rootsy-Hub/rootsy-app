export const HR_PEOPLE_FILTERS = [
  { value: "negocio", label: "Todas" },
  { value: "local", label: "En el local" },
  { value: "acceso", label: "Con Rootsy" },
  { value: "invitadas", label: "Invitadas" },
  { value: "baja", label: "Ya no" },
] as const

export type PeopleFilter = (typeof HR_PEOPLE_FILTERS)[number]["value"]
