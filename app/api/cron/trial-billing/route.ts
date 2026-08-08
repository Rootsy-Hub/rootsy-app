import { NextResponse } from "next/server"
import {
  BILLING_TRIAL_JOB_ENABLED_ENV,
  CRON_SECRET_ENV,
} from "@/lib/platformBilling/constants"
import { processTrialBillingJob } from "@/lib/platformBilling/jobs/processTrialBilling"

export const runtime = "nodejs"
export const maxDuration = 300

function isCronAuthorized(request: Request): boolean {
  const secret = process.env[CRON_SECRET_ENV]?.trim()
  if (!secret) {
    return process.env.NODE_ENV !== "production"
  }

  const authHeader = request.headers.get("authorization")?.trim()
  return authHeader === `Bearer ${secret}`
}

function isJobEnabled(): boolean {
  const raw = process.env[BILLING_TRIAL_JOB_ENABLED_ENV]?.trim().toLowerCase()
  if (!raw) return true
  return raw === "1" || raw === "true" || raw === "yes"
}

async function handleTrialBillingCron(request: Request) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  if (!isJobEnabled()) {
    return NextResponse.json({
      ok: true,
      enabled: false,
      message: "Job de fin de trial deshabilitado",
    })
  }

  try {
    const result = await processTrialBillingJob()
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido"
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

export async function GET(request: Request) {
  return handleTrialBillingCron(request)
}

export async function POST(request: Request) {
  return handleTrialBillingCron(request)
}
