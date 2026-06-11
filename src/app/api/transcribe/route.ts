import { NextResponse } from "next/server"
import OpenAI from "openai"
import fs from "fs"
import path from "path"
import { randomUUID } from "crypto"

export const dynamic = "force-dynamic"
export const maxDuration = 60

export async function POST(request: Request) {
  // Instanciation request-time : évite le crash au build quand la clé est absente
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  let tmpPath: string | null = null

  try {
    const formData = await request.formData()
    const audio = formData.get("audio")

    if (!audio || !(audio instanceof File)) {
      return NextResponse.json({ error: "Pas de fichier audio" }, { status: 400 })
    }

    // Écrire en /tmp (seul dossier writable sur Vercel)
    const arrayBuffer = await audio.arrayBuffer()
    tmpPath = path.join("/tmp", `${randomUUID()}.webm`)
    fs.writeFileSync(tmpPath, Buffer.from(arrayBuffer))

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tmpPath),
      model: "whisper-1",
      language: "fr",
      response_format: "verbose_json",
    })

    return NextResponse.json({
      text: transcription.text,
      segments: transcription.segments ?? [],
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Internal error"
    return NextResponse.json({ error: message }, { status: 500 })
  } finally {
    if (tmpPath) {
      try { fs.unlinkSync(tmpPath) } catch { /* déjà supprimé */ }
    }
  }
}
