import { NextResponse } from "next/server"
import { getAppBaseUrl } from "@/lib/appUrl"
import { sendResendEmail } from "@/lib/email/sendResendEmail"
import { buildPopInvitationEmail } from "@/lib/email/templates/popInvitationEmail"
import { rootsyApiErrorResponse, rootsyApiFetch } from "@/lib/rootsyApi/server"

type RouteCtx = { params: Promise<{ popId: string }> }

type InviteApiOk = {
  success: true
  data: { inviteUrl: string; email: string; popName: string }
}

export async function POST(request: Request, ctx: RouteCtx) {
  try {
    const { popId } = await ctx.params
    const incoming = (await request.json().catch(() => null)) as
      | Record<string, unknown>
      | null
    const data = (await rootsyApiFetch(`/v1/pops/${popId}/hr/invitations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...(incoming ?? {}),
        inviteBaseUrl: getAppBaseUrl(),
      }),
    })) as InviteApiOk

    const invitationEmail = buildPopInvitationEmail({
      popName: data.data.popName,
      inviteUrl: data.data.inviteUrl,
      message:
        incoming && typeof incoming.message === "string"
          ? incoming.message
          : null,
    })

    const resendConfigured = Boolean(process.env.RESEND_API_KEY?.trim())
    const { sent, error: emailError } = await sendResendEmail({
      to: data.data.email,
      subject: invitationEmail.subject,
      html: invitationEmail.html,
      text: invitationEmail.text,
    })

    return NextResponse.json({
      success: true,
      data: {
        inviteUrl: data.data.inviteUrl,
        emailSent: sent,
        emailError,
        resendConfigured,
      },
    })
  } catch (error) {
    return rootsyApiErrorResponse(error)
  }
}
