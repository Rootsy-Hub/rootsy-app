/** Tokens de email alineados a `lib/design-system/tokens/colors.ts`. */
export const ROOTSY_EMAIL_THEME = {
  bruma50: "#F4F6F9",
  bruma100: "#EEF1F5",
  bruma200: "#DFE4EA",
  bruma500: "#64748B",
  bruma700: "#334155",
  bruma900: "#121417",
  savia600: "#059669",
  savia700: "#047857",
  savia50: "#ECFDF5",
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
