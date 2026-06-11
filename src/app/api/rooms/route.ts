import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const DAILY_API = "https://api.daily.co/v1"

export async function POST(request: Request) {
  try {
    const { roomName, title } = (await request.json()) as {
      roomName: string
      title?: string
    }

    const response = await fetch(`${DAILY_API}/rooms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        name: roomName,
        privacy: "private",
        properties: {
          enable_recording: "cloud",
          enable_chat: true,
          enable_screenshare: true,
          exp: Math.floor(Date.now() / 1000) + 60 * 60 * 4,
          max_participants: 20,
          start_audio_off: false,
          start_video_off: false,
          lang: "fr",
        },
      }),
    })

    if (!response.ok) {
      const err: unknown = await response.json()
      return NextResponse.json({ error: err }, { status: response.status })
    }

    const room = (await response.json()) as { url: string; name: string }
    return NextResponse.json({ url: room.url, name: room.name, title })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Internal error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
