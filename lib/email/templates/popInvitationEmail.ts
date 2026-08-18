import { escapeHtml } from "@/lib/email/escapeHtml"
import {
  POP_INVITATION_EMAIL_CTA,
  POP_INVITATION_EMAIL_MESSAGE_INTRO,
  popInvitationEmailBody,
  popInvitationEmailPreheader,
  popInvitationEmailSubject,
  ROOTSY_EMAIL_GREETING,
  ROOTSY_EMAIL_PREVIEW,
} from "@/lib/email/rootsyEmailVoice"
import { ROOTSY_EMAIL_THEME as T } from "@/lib/email/rootsyEmailTheme"
import {
  renderRootsyTransactionalLink,
  renderRootsyTransactionalMinimalLayout,
  renderRootsyTransactionalMutedUrl,
  renderRootsyTransactionalPreviewBanner,
} from "@/lib/email/templates/rootsyEmailLayout"
import {
  plainTextActionLink,
  plainTextBlock,
  plainTextFallbackUrl,
  plainTextFooter,
  plainTextPreviewBanner,
} from "@/lib/email/templates/rootsyEmailPlainText"

export type PopInvitationEmailInput = {
  popName: string
  inviteUrl: string
  message?: string | null
  isPreview?: boolean
}

export type PopInvitationEmailContent = {
  subject: string
  html: string
  text: string
}

export { popInvitationEmailSubject }

export function renderPopInvitationEmailHtml(
  input: PopInvitationEmailInput,
): string {
  const safePopName = escapeHtml(input.popName)
  const safeMessage = input.message?.trim()
    ? escapeHtml(input.message.trim())
    : null

  const previewBanner = input.isPreview
    ? renderRootsyTransactionalPreviewBanner(ROOTSY_EMAIL_PREVIEW.invitation)
    : ""

  const messageBlock = safeMessage
    ? `<p style="margin:0 0 16px;font-family:${T.fontFamily};font-size:15px;line-height:1.6;color:${T.bruma700}">
        ${POP_INVITATION_EMAIL_MESSAGE_INTRO} <span style="color:${T.bruma900}">${safeMessage}</span>
      </p>`
    : ""

  const contentHtml = `
    <p style="margin:0 0 16px;font-family:${T.fontFamily};font-size:15px;line-height:1.6;color:${T.bruma900}">
      ${ROOTSY_EMAIL_GREETING}
    </p>
    <p style="margin:0 0 16px;font-family:${T.fontFamily};font-size:15px;line-height:1.6;color:${T.bruma900}">
      ${escapeHtml(popInvitationEmailBody(input.popName))}
    </p>
    ${messageBlock}
    ${renderRootsyTransactionalLink({
      href: input.inviteUrl,
      label: POP_INVITATION_EMAIL_CTA,
    })}
    ${renderRootsyTransactionalMutedUrl(input.inviteUrl)}
  `.trim()

  return renderRootsyTransactionalMinimalLayout({
    preheader: popInvitationEmailPreheader(input.popName),
    previewBannerHtml: previewBanner,
    contentHtml,
  })
}

export function renderPopInvitationEmailText(
  input: PopInvitationEmailInput,
): string {
  const messageBlock = input.message?.trim()
    ? `${POP_INVITATION_EMAIL_MESSAGE_INTRO} ${input.message.trim()}`
    : ""

  const previewBlock = input.isPreview
    ? plainTextPreviewBanner(ROOTSY_EMAIL_PREVIEW.invitation)
    : ""

  return plainTextBlock([
    previewBlock,
    ROOTSY_EMAIL_GREETING,
    popInvitationEmailBody(input.popName),
    messageBlock,
    plainTextActionLink(POP_INVITATION_EMAIL_CTA, input.inviteUrl),
    plainTextFallbackUrl(input.inviteUrl),
  ]).concat(plainTextFooter())
}

export function buildPopInvitationEmail(
  input: PopInvitationEmailInput,
): PopInvitationEmailContent {
  return {
    subject: popInvitationEmailSubject(input.popName),
    html: renderPopInvitationEmailHtml(input),
    text: renderPopInvitationEmailText(input),
  }
}
