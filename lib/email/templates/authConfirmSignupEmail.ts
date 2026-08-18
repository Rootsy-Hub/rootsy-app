import {
  AUTH_CONFIRM_SIGNUP_EMAIL_BODY,
  AUTH_CONFIRM_SIGNUP_EMAIL_CTA,
  AUTH_CONFIRM_SIGNUP_EMAIL_DISCLAIMER,
  AUTH_CONFIRM_SIGNUP_EMAIL_FOOTER,
  AUTH_CONFIRM_SIGNUP_EMAIL_PREHEADER,
  authConfirmSignupEmailSubject,
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

export type AuthConfirmSignupEmailInput = {
  confirmationUrl: string
  isPreview?: boolean
}

export type AuthConfirmSignupEmailContent = {
  subject: string
  html: string
  text: string
}

export { authConfirmSignupEmailSubject }

export function renderAuthConfirmSignupEmailHtml(
  input: AuthConfirmSignupEmailInput,
): string {
  const previewBanner = input.isPreview
    ? renderRootsyTransactionalPreviewBanner(ROOTSY_EMAIL_PREVIEW.generic)
    : ""

  const contentHtml = `
    ${authEmailParagraph(ROOTSY_EMAIL_GREETING)}
    ${authEmailParagraph(AUTH_CONFIRM_SIGNUP_EMAIL_BODY)}
    ${renderRootsyTransactionalLink({
      href: input.confirmationUrl,
      label: AUTH_CONFIRM_SIGNUP_EMAIL_CTA,
    })}
    ${renderRootsyTransactionalMutedUrl(input.confirmationUrl)}
    ${authEmailMutedParagraph(AUTH_CONFIRM_SIGNUP_EMAIL_DISCLAIMER)}
  `.trim()

  return renderRootsyTransactionalMinimalLayout({
    preheader: AUTH_CONFIRM_SIGNUP_EMAIL_PREHEADER,
    previewBannerHtml: previewBanner,
    contentHtml,
    footerNote: AUTH_CONFIRM_SIGNUP_EMAIL_FOOTER,
  })
}

export function renderAuthConfirmSignupEmailText(
  input: AuthConfirmSignupEmailInput,
): string {
  const previewBlock = input.isPreview
    ? plainTextPreviewBanner(ROOTSY_EMAIL_PREVIEW.generic)
    : ""

  return plainTextBlock([
    previewBlock,
    ROOTSY_EMAIL_GREETING,
    AUTH_CONFIRM_SIGNUP_EMAIL_BODY,
    plainTextActionLink(AUTH_CONFIRM_SIGNUP_EMAIL_CTA, input.confirmationUrl),
    plainTextFallbackUrl(input.confirmationUrl),
    AUTH_CONFIRM_SIGNUP_EMAIL_DISCLAIMER,
  ]).concat(plainTextFooter(AUTH_CONFIRM_SIGNUP_EMAIL_FOOTER))
}

export function buildAuthConfirmSignupEmail(
  input: AuthConfirmSignupEmailInput,
): AuthConfirmSignupEmailContent {
  return {
    subject: authConfirmSignupEmailSubject(),
    html: renderAuthConfirmSignupEmailHtml(input),
    text: renderAuthConfirmSignupEmailText(input),
  }
}
