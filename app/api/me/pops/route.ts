import { NextResponse } from "next/server"
import { RootsyApiError, rootsyApiFetch } from "@/lib/rootsyApi/server"

export async function GET() {
  try {
    const data = await rootsyApiFetch("/v1/me/pops")
    return NextResponse.json(data)
  } catch (error) {
    if (error instanceof RootsyApiError) {
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
}
