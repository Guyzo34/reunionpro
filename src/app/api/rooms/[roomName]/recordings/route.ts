import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const DAILY_API = "https://api.daily.co/v1"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ roomName: string }> },
) {
  try {
    const { roomName } = await params

    const response = await fetch(
      `${DAILY_API}/recordings?room_name=${encodeURIComponent(roomName)}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
        },
      },
    )

    const data: unknown = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Internal error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
