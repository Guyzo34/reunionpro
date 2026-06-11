import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const DAILY_API = "https://api.daily.co/v1"

export async function POST(request: Request) {
  try {
    const { roomName, userName, isOwner } = (await request.json()) as {
      roomName: string
      userName: string
      isOwner?: boolean
    }

    const dailyHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
    }

    const tokenRes = await fetch(`${DAILY_API}/meeting-tokens`, {
      method: "POST",
      headers: dailyHeaders,
      body: JSON.stringify({
        properties: {
          room_name: roomName,
          user_name: userName,
          is_owner: !!isOwner,
          ...(isOwner ? { enable_recording: "cloud" } : {}),
          exp: Math.floor(Date.now() / 1000) + 60 * 60 * 4,
        },
      }),
    })

    const tokenData = (await tokenRes.json()) as Record<string, unknown>

    const roomRes = await fetch(`${DAILY_API}/rooms/${roomName}`, {
      headers: dailyHeaders,
    })
    const roomData = (await roomRes.json()) as { url: string }

    return NextResponse.json({ ...tokenData, roomUrl: roomData.url })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Internal error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
