import { ROOTSY_BRAND_SLOGAN } from "@/lib/rootsyBrand"
import { ROOTSY_EMAIL_LINK_FALLBACK, ROOTSY_EMAIL_SIGNATURE_LINE } from "@/lib/email/rootsyEmailVoice"

export const ROOTSY_EMAIL_PLAIN_SIGNATURE = `\n\n${ROOTSY_EMAIL_SIGNATURE_LINE}\n${ROOTSY_BRAND_SLOGAN}`

export function plainTextBlock(paragraphs: string[]): string {
  return paragraphs.filter((p) => p.trim().length > 0).join("\n\n")
}

export function plainTextActionLink(label: string, url: string): string {
  return `${label}:\n${url}`
}

export function plainTextFallbackUrl(url: string): string {
  return `${ROOTSY_EMAIL_LINK_FALLBACK}\n${url}`
}

export function plainTextPreviewBanner(message: string): string {
  return `[Aviso] ${message}`
}

export function plainTextFooter(note?: string): string {
  if (note?.trim()) {
    return `\n\n${note.trim()}${ROOTSY_EMAIL_PLAIN_SIGNATURE}`
  }
  return ROOTSY_EMAIL_PLAIN_SIGNATURE
}
