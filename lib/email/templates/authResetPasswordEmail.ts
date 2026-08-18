import {
  AUTH_RESET_PASSWORD_EMAIL_BODY,
  AUTH_RESET_PASSWORD_EMAIL_CTA,
  AUTH_RESET_PASSWORD_EMAIL_DISCLAIMER,
  AUTH_RESET_PASSWORD_EMAIL_FOOTER,
  AUTH_RESET_PASSWORD_EMAIL_PREHEADER,
  authResetPasswordEmailSubject,
  ROOTSY_EMAIL_GREETING,
  ROOTSY_EMAIL_PREVIEW,
} from "@/lib/email/rootsyEmailVoice"
import {
  renderRootsyTransactionalLink,
  renderRootsyTransactionalMinimalLayout,
  renderRootsyTransactionalMutedUrl,
  renderRootsyTransactionalPreviewBanner,
} from "@/lib/email/templates/rootsyEmailLayout"
import {
  authEmailMutedParagraph,
  authEmailParagraph,
} from "@/lib/email/templates/authEmailShared"
import {
  plainTextActionLink,
  plainTextBlock,
  plainTextFallbackUrl,
  plainTextFooter,
  plainTextPreviewBanner,
} from "@/lib/email/templates/rootsyEmailPlainText"

export type AuthResetPasswordEmailInput = {
  recoveryUrl: string
  isPreview?: boolean
}

export type AuthResetPasswordEmailContent = {
  subject: string
  html: string
  text: string
}

export { authResetPasswordEmailSubject }

export function renderAuthResetPasswordEmailHtml(
  input: AuthResetPasswordEmailInput,
): string {
  const previewBanner = input.isPreview
    ? renderRootsyTransactionalPreviewBanner(ROOTSY_EMAIL_PREVIEW.generic)
    : ""

  const contentHtml = `
    ${authEmailParagraph(ROOTSY_EMAIL_GREETING)}
    ${authEmailParagraph(AUTH_RESET_PASSWORD_EMAIL_BODY)}
    ${renderRootsyTransactionalLink({
      href: input.recoveryUrl,
      label: AUTH_RESET_PASSWORD_EMAIL_CTA,
    })}
    ${renderRootsyTransactionalMutedUrl(input.recoveryUrl)}
    ${authEmailMutedParagraph(AUTH_RESET_PASSWORD_EMAIL_DISCLAIMER)}
  `.trim()

  return renderRootsyTransactionalMinimalLayout({
    preheader: AUTH_RESET_PASSWORD_EMAIL_PREHEADER,
    previewBannerHtml: previewBanner,
    contentHtml,
    footerNote: AUTH_RESET_PASSWORD_EMAIL_FOOTER,
  })
}

export function renderAuthResetPasswordEmailText(
  input: AuthResetPasswordEmailInput,
): string {
  const previewBlock = input.isPreview
    ? plainTextPreviewBanner(ROOTSY_EMAIL_PREVIEW.generic)
    : ""

  return plainTextBlock([
    previewBlock,
    ROOTSY_EMAIL_GREETING,
    AUTH_RESET_PASSWORD_EMAIL_BODY,
    plainTextActionLink(AUTH_RESET_PASSWORD_EMAIL_CTA, input.recoveryUrl),
    plainTextFallbackUrl(input.recoveryUrl),
    AUTH_RESET_PASSWORD_EMAIL_DISCLAIMER,
  ]).concat(plainTextFooter(AUTH_RESET_PASSWORD_EMAIL_FOOTER))
}

export function buildAuthResetPasswordEmail(
  input: AuthResetPasswordEmailInput,
): AuthResetPasswordEmailContent {
  return {
    subject: authResetPasswordEmailSubject(),
    html: renderAuthResetPasswordEmailHtml(input),
    text: renderAuthResetPasswordEmailText(input),
  }
}
