import "server-only"

import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

const SECRET_HEADER = "x-rootsy-api-secret"

export class RootsyApiError extends Error {
  status: number
  body: unknown

  constructor(message: string, status: number, body?: unknown) {
    super(message)
    this.name = "RootsyApiError"
    this.status = status
    this.body = body
  }
}

function apiBase(): string {
  const url = process.env.ROOTSY_API_URL?.trim()
  if (!url) throw new Error("Falta ROOTSY_API_URL")
  return url.replace(/\/$/, "")
}

function apiSecret(): string {
  const secret = process.env.ROOTSY_API_SECRET?.trim()
  if (!secret) throw new Error("Falta ROOTSY_API_SECRET")
  return secret
}

export async function rootsyApiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const token = session?.access_token
  if (!token) throw new RootsyApiError("Unauthorized", 401)

  const res = await fetch(`${apiBase()}${path}`, {
    ...init,
    headers: {
      accept: "application/json",
      authorization: `Bearer ${token}`,
      [SECRET_HEADER]: apiSecret(),
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  })

  const body = await res.json().catch(() => null)
  if (!res.ok) {
    const msg =
      body && typeof body === "object" && "error" in body
        ? String((body as { error: unknown }).error)
        : `rootsy-api ${res.status}`
    throw new RootsyApiError(msg, res.status, body)
  }
  return body as T
}

export function rootsyApiErrorResponse(error: unknown) {
  if (error instanceof RootsyApiError) {
    if (error.body && typeof error.body === "object") {
      return NextResponse.json(error.body, { status: error.status })
    }
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.status },
    )
  }
  return NextResponse.json(
    { success: false, error: "Error interno" },
    { status: 500 },
  )
}
