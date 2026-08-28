/** Tokens de email alineados a `lib/design-system/tokens/colors.ts`. */
export const ROOTSY_EMAIL_THEME = {
  bruma50: "#F8FAF5",
  bruma100: "#F3F5EF",
  bruma200: "#E5EEE2",
  bruma500: "#8A988C",
  bruma700: "#4A554C",
  bruma900: "#1C231E",
  savia600: "#01C96A",
  savia700: "#019952",
  savia50: "#E8FFF3",
  white: "#FFFFFF",
  dangerBg: "#FEF2F2",
  dangerBorder: "#FECACA",
  dangerText: "#991B1B",
  warningBg: "#FEF9C3",
  warningBorder: "#FDE047",
  warningText: "#854D0E",
  fontFamily:
    "'Nunito Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif",
  contentWidth: 560,
  radius: 16,
  buttonRadius: 10,
  logoWidth: 135,
  logoHeight: 44,
} as const

/** PNG para clientes de correo sin soporte SVG (Outlook, etc.). */
export const ROOTSY_EMAIL_LOGO_PATH =
  "/logos/rootsy/rootsy-logo-brand-email.png"

export { ROOTSY_BRAND_SLOGAN as ROOTSY_EMAIL_SLOGAN } from "@/lib/rootsyBrand"
