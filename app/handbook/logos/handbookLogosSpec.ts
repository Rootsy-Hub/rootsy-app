/**
 * Spec de logotipos del handbook.
 * Lockups, POP y persona salen de /library. Acá vive el criterio de uso.
 */

import {
  LOGO_ANATOMY,
  LOGO_CLEARANCE,
  LOGO_GUIDELINES,
  POP_IDENTITY_SPECIMEN,
  POP_IDENTITY_VARIANTS,
  ROOTSY_LOGO_LOCKUPS,
  ROOTSY_LOGOMARKS,
  USER_PROFILE_GUIDELINES,
  USER_PROFILE_SPECIMEN,
  USER_PROFILE_VARIANTS,
} from "@/app/library/logos/rootsyLogoSystem"

export const HANDBOOK_LOGO_LOCKUPS = ROOTSY_LOGO_LOCKUPS
export const HANDBOOK_LOGOMARKS = ROOTSY_LOGOMARKS
export const HANDBOOK_LOGO_ANATOMY = LOGO_ANATOMY
export const HANDBOOK_LOGO_CLEARANCE = LOGO_CLEARANCE
export const HANDBOOK_LOGO_GUIDELINES = LOGO_GUIDELINES
export const HANDBOOK_POP_SPECIMEN = POP_IDENTITY_SPECIMEN
export const HANDBOOK_POP_VARIANTS = POP_IDENTITY_VARIANTS
export const HANDBOOK_USER_SPECIMEN = USER_PROFILE_SPECIMEN
export const HANDBOOK_USER_VARIANTS = USER_PROFILE_VARIANTS
export const HANDBOOK_USER_GUIDELINES = USER_PROFILE_GUIDELINES

export const HANDBOOK_LOGO_PRINCIPLES = [
  {
    title: "Tres identidades",
    detail:
      "Rootsy es la plataforma. El POP es el negocio. La persona es quien opera. Cada una con su cara.",
  },
  {
    title: "Lockup fijo, nombre nativo",
    detail:
      "Rootsy usa logomark + wordmark. El POP se lee con foto y tipografía nativa — no hay wordmark del tenant.",
  },
  {
    title: "La forma anticipa el uso",
    detail:
      "Círculo en home. Cuadrado en header. Logo B/N aparte para tickets. Persona siempre en círculo.",
  },
] as const
