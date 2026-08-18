import { escapeHtml } from "@/lib/email/escapeHtml"
import {
  ROOTSY_EMAIL_GREETING,
  ROOTSY_EMAIL_PREVIEW,
  TRIAL_BILLING_FAILURE_EMAIL_ACTION,
  TRIAL_BILLING_FAILURE_EMAIL_CTA,
  TRIAL_BILLING_FAILURE_EMAIL_ERROR_PREFIX,
  TRIAL_BILLING_FAILURE_EMAIL_FOOTER,
  TRIAL_BILLING_FAILURE_EMAIL_SUPPORT,
  trialBillingFailureEmailBody,
  trialBillingFailureEmailPreheader,
  trialBillingFailureEmailSubject,
} from "@/lib/email/rootsyEmailVoice"
import { ROOTSY_EMAIL_THEME as T } from "@/lib/email/rootsyEmailTheme"
import {
  renderRootsyTransactionalLink,
  renderRootsyTransactionalMinimalLayout,
  renderRootsyTransactionalPreviewBanner,
} from "@/lib/email/templates/rootsyEmailLayout"
import {
  plainTextActionLink,
  plainTextBlock,
  plainTextFooter,
  plainTextPreviewBanner,
} from "@/lib/email/templates/rootsyEmailPlainText"

export type TrialBillingFailureEmailInput = {
  popName: string
  trialEndsAt: string
  failureMessage: string
  homeUrl: string
  isPreview?: boolean
}

export type TrialBillingFailureEmailContent = {
  subject: string
  html: string
  text: string
}

export { trialBillingFailureEmailSubject }

function formatTrialEndsAt(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date)
}

export function renderTrialBillingFailureEmailHtml(
  input: TrialBillingFailureEmailInput,
): string {
  const safeMessage = escapeHtml(input.failureMessage)
  const trialEndsAt = formatTrialEndsAt(input.trialEndsAt)
  const safeBody = escapeHtml(
    trialBillingFailureEmailBody(input.popName, trialEndsAt),
  )

  const previewBanner = input.isPreview
    ? renderRootsyTransactionalPreviewBanner(ROOTSY_EMAIL_PREVIEW.billing)
    : ""

  const contentHtml = `
    <p style="margin:0 0 16px;font-family:${T.fontFamily};font-size:15px;line-height:1.6;color:${T.bruma900}">
      ${ROOTSY_EMAIL_GREETING}
    </p>
    <p style="margin:0 0 16px;font-family:${T.fontFamily};font-size:15px;line-height:1.6;color:${T.bruma900}">
      ${safeBody}
    </p>
    <p style="margin:0 0 16px;padding:10px 12px;border-left:3px solid ${T.dangerBorder};background:${T.dangerBg};font-family:${T.fontFamily};font-size:14px;line-height:1.5;color:${T.dangerText}">
      ${safeMessage}
    </p>
    <p style="margin:0 0 16px;font-family:${T.fontFamily};font-size:15px;line-height:1.6;color:${T.bruma700}">
      ${TRIAL_BILLING_FAILURE_EMAIL_ACTION}
    </p>
    ${renderRootsyTransactionalLink({
      href: input.homeUrl,
      label: TRIAL_BILLING_FAILURE_EMAIL_CTA,
    })}
    <p style="margin:0;font-family:${T.fontFamily};font-size:13px;line-height:1.6;color:${T.bruma500}">
      ${TRIAL_BILLING_FAILURE_EMAIL_SUPPORT}
    </p>
  `.trim()

  return renderRootsyTransactionalMinimalLayout({
    preheader: trialBillingFailureEmailPreheader(input.popName),
    previewBannerHtml: previewBanner,
    contentHtml,
    footerNote: TRIAL_BILLING_FAILURE_EMAIL_FOOTER,
  })
}

export function renderTrialBillingFailureEmailText(
  input: TrialBillingFailureEmailInput,
): string {
  const trialEndsAt = formatTrialEndsAt(input.trialEndsAt)

  const previewBlock = input.isPreview
    ? plainTextPreviewBanner(ROOTSY_EMAIL_PREVIEW.billing)
    : ""

  return plainTextBlock([
    previewBlock,
    ROOTSY_EMAIL_GREETING,
    trialBillingFailureEmailBody(input.popName, trialEndsAt),
    `${TRIAL_BILLING_FAILURE_EMAIL_ERROR_PREFIX} ${input.failureMessage}`,
    TRIAL_BILLING_FAILURE_EMAIL_ACTION,
    plainTextActionLink(TRIAL_BILLING_FAILURE_EMAIL_CTA, input.homeUrl),
    TRIAL_BILLING_FAILURE_EMAIL_SUPPORT,
  ]).concat(plainTextFooter(TRIAL_BILLING_FAILURE_EMAIL_FOOTER))
}

export function buildTrialBillingFailureEmail(
  input: TrialBillingFailureEmailInput,
): TrialBillingFailureEmailContent {
  return {
    subject: trialBillingFailureEmailSubject(input.popName),
    html: renderTrialBillingFailureEmailHtml(input),
    text: renderTrialBillingFailureEmailText(input),
  }
}
