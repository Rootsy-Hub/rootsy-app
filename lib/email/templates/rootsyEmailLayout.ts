import { getAppBaseUrl } from "@/lib/appUrl"
import { escapeHtml } from "@/lib/email/escapeHtml"
import {
  ROOTSY_EMAIL_LOGO_PATH,
  ROOTSY_EMAIL_THEME as T,
} from "@/lib/email/rootsyEmailTheme"
import { ROOTSY_BRAND_SLOGAN } from "@/lib/rootsyBrand"
import {
  ROOTSY_EMAIL_LINK_FALLBACK,
  ROOTSY_EMAIL_SIGNATURE_LINE,
} from "@/lib/email/rootsyEmailVoice"

export type RootsyEmailLayoutInput = {
  /** Texto de vista previa en bandeja de entrada (opcional). */
  preheader?: string
  /** Banner amarillo de prueba u otro aviso arriba del cuerpo. */
  previewBannerHtml?: string
  /** HTML del cuerpo principal (párrafos, callouts, botones). */
  contentHtml: string
  /** Nota extra en el footer, debajo del legal estándar. */
  footerNote?: string
  /** URL base para links; default `getAppBaseUrl()`. */
  appUrl?: string
  /** URL absoluta del logo; default `{appUrl}{ROOTSY_EMAIL_LOGO_PATH}`. */
  logoUrl?: string
}

export type RootsyTransactionalMinimalLayoutInput = {
  preheader?: string
  previewBannerHtml?: string
  contentHtml: string
  footerNote?: string
}

export type RootsyEmailButtonInput = {
  href: string
  label: string
  /** Para plantillas Supabase Auth con `{{ .ConfirmationURL }}`. */
  preserveTemplateSyntax?: boolean
}

export type RootsyEmailCalloutInput = {
  tone: "danger" | "warning" | "info"
  html: string
}

function resolveAppUrl(appUrl?: string): string {
  return (appUrl ?? getAppBaseUrl()).replace(/\/$/, "")
}

function calloutStyles(tone: RootsyEmailCalloutInput["tone"]) {
  if (tone === "danger") {
    return {
      background: T.dangerBg,
      border: T.dangerBorder,
      color: T.dangerText,
    }
  }
  if (tone === "warning") {
    return {
      background: T.warningBg,
      border: T.warningBorder,
      color: T.warningText,
    }
  }
  return {
    background: T.savia50,
    border: "#A7F3D0",
    color: T.savia700,
  }
}

/** Banner estándar para envíos de prueba desde Uroboros. */
export function renderRootsyEmailPreviewBanner(message: string): string {
  return renderRootsyEmailCallout({
    tone: "warning",
    html: escapeHtml(message),
  })
}

export function renderRootsyEmailCallout(input: RootsyEmailCalloutInput): string {
  const styles = calloutStyles(input.tone)
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px">
      <tr>
        <td style="padding:12px 14px;background:${styles.background};border:1px solid ${styles.border};border-radius:12px;color:${styles.color};font-size:14px;line-height:1.5">
          ${input.html}
        </td>
      </tr>
    </table>
  `.trim()
}

export function renderRootsyEmailButton(input: RootsyEmailButtonInput): string {
  const safeHref = input.preserveTemplateSyntax
    ? input.href
    : escapeHtml(input.href)
  const safeLabel = escapeHtml(input.label)
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px">
      <tr>
        <td style="border-radius:${T.buttonRadius}px;background:${T.savia600}">
          <a
            href="${safeHref}"
            style="display:inline-block;padding:12px 20px;font-family:${T.fontFamily};font-size:15px;font-weight:700;line-height:1;color:${T.white};text-decoration:none;border-radius:${T.buttonRadius}px"
          >
            ${safeLabel}
          </a>
        </td>
      </tr>
    </table>
  `.trim()
}

export function renderRootsyEmailMutedUrl(
  href: string,
  options?: { preserveTemplateSyntax?: boolean },
): string {
  const safeHref = options?.preserveTemplateSyntax ? href : escapeHtml(href)
  return `
    <p style="margin:0;font-family:${T.fontFamily};font-size:13px;line-height:1.6;color:${T.bruma500}">
      ${ROOTSY_EMAIL_LINK_FALLBACK}<br/>
      <a href="${safeHref}" style="color:${T.savia600};word-break:break-all">${safeHref}</a>
    </p>
  `.trim()
}

/** Aviso simple para envíos de prueba (layout transaccional). */
export function renderRootsyTransactionalPreviewBanner(message: string): string {
  const safeMessage = escapeHtml(message)
  return `
    <p style="margin:0 0 16px;padding:10px 12px;border-left:3px solid ${T.warningBorder};background:${T.warningBg};font-family:${T.fontFamily};font-size:14px;line-height:1.5;color:${T.warningText}">
      ${safeMessage}
    </p>
  `.trim()
}

/** Link de acción en texto, sin botón tipo campaña. */
export function renderRootsyTransactionalLink(
  input: RootsyEmailButtonInput,
): string {
  const safeHref = input.preserveTemplateSyntax
    ? input.href
    : escapeHtml(input.href)
  const safeLabel = escapeHtml(input.label)
  return `
    <p style="margin:0 0 16px;font-family:${T.fontFamily};font-size:15px;line-height:1.6;color:${T.bruma900}">
      <a href="${safeHref}" style="color:${T.savia700};text-decoration:underline;font-weight:600">${safeLabel}</a>
    </p>
  `.trim()
}

export function renderRootsyTransactionalMutedUrl(
  href: string,
  options?: { preserveTemplateSyntax?: boolean },
): string {
  const safeHref = options?.preserveTemplateSyntax ? href : escapeHtml(href)
  return `
    <p style="margin:0 0 16px;font-family:${T.fontFamily};font-size:13px;line-height:1.6;color:${T.bruma500}">
      ${ROOTSY_EMAIL_LINK_FALLBACK}<br/>
      <span style="word-break:break-all;color:${T.bruma700}">${safeHref}</span>
    </p>
  `.trim()
}

/** Layout transaccional: texto-first, sin logo ni tarjeta de campaña. */
export function renderRootsyTransactionalMinimalLayout(
  input: RootsyTransactionalMinimalLayoutInput,
): string {
  const safePreheader = input.preheader ? escapeHtml(input.preheader) : ""
  const safeFooterNote = input.footerNote
    ? `<p style="margin:8px 0 0;font-family:${T.fontFamily};font-size:12px;line-height:1.5;color:${T.bruma500}">${escapeHtml(input.footerNote)}</p>`
    : ""

  const preheaderBlock = safePreheader
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;mso-hide:all">${safePreheader}</div>`
    : ""

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Rootsy</title>
</head>
<body style="margin:0;padding:20px 16px;background:${T.white};font-family:${T.fontFamily};font-size:15px;line-height:1.6;color:${T.bruma900};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%">
  ${preheaderBlock}
  <p style="margin:0 0 20px;font-family:${T.fontFamily};font-size:13px;font-weight:700;line-height:1.4;color:${T.bruma700}">Rootsy</p>
  ${input.previewBannerHtml ?? ""}
  ${input.contentHtml}
  <p style="margin:24px 0 0;font-family:${T.fontFamily};font-size:12px;line-height:1.5;color:${T.bruma500}">${escapeHtml(ROOTSY_EMAIL_SIGNATURE_LINE)}</p>
  <p style="margin:4px 0 0;font-family:${T.fontFamily};font-size:11px;line-height:1.5;color:${T.bruma500}">${escapeHtml(ROOTSY_BRAND_SLOGAN)}</p>
  ${safeFooterNote}
</body>
</html>`.trim()
}

export function renderRootsyEmailLayout(input: RootsyEmailLayoutInput): string {
  const appUrl = resolveAppUrl(input.appUrl)
  const logoUrl =
    input.logoUrl ?? `${appUrl}${ROOTSY_EMAIL_LOGO_PATH}`
  const safePreheader = input.preheader ? escapeHtml(input.preheader) : ""
  const safeFooterNote = input.footerNote
    ? `<p style="margin:0 0 8px;font-family:${T.fontFamily};font-size:12px;line-height:1.5;color:${T.bruma500}">${escapeHtml(input.footerNote)}</p>`
    : ""

  const preheaderBlock = safePreheader
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;mso-hide:all">${safePreheader}</div>`
    : ""

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>Rootsy</title>
</head>
<body style="margin:0;padding:0;background:${T.bruma100};font-family:${T.fontFamily};color:${T.bruma900};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%">
  ${preheaderBlock}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${T.bruma100};padding:32px 16px">
    <tr>
      <td align="center">
        <table role="presentation" width="${T.contentWidth}" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:${T.contentWidth}px">
          <tr>
            <td style="padding:0 0 20px" align="center">
              <a href="${appUrl}" style="text-decoration:none">
                <img
                  src="${logoUrl}"
                  width="${T.logoWidth}"
                  height="${T.logoHeight}"
                  alt="Rootsy"
                  style="display:block;border:0;outline:none;text-decoration:none;height:auto;max-width:${T.logoWidth}px"
                />
              </a>
            </td>
          </tr>
          <tr>
            <td style="background:${T.white};border:1px solid ${T.bruma200};border-radius:${T.radius}px;padding:28px 24px 24px">
              ${input.previewBannerHtml ?? ""}
              ${input.contentHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 8px 0;text-align:center">
              ${safeFooterNote}
              <p style="margin:0 0 8px;font-family:${T.fontFamily};font-size:12px;line-height:1.5;color:${T.bruma500}">
                ${escapeHtml(ROOTSY_EMAIL_SIGNATURE_LINE)}
              </p>
              <p style="margin:0;font-family:${T.fontFamily};font-size:11px;line-height:1.5;color:${T.bruma500}">
                ${escapeHtml(ROOTSY_BRAND_SLOGAN)}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim()
}
