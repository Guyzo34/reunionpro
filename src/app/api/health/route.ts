import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export function GET() {
  return NextResponse.json({
    status: "ok",
    daily: !!process.env.DAILY_API_KEY,
    openai: !!process.env.OPENAI_API_KEY,
  })
}
