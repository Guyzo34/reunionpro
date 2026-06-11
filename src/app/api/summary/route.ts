import { NextResponse } from "next/server"
import OpenAI from "openai"

export const dynamic = "force-dynamic"
export const maxDuration = 60

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(request: Request) {
  try {
    const { transcript, title, participants, duration } = (await request.json()) as {
      transcript: string
      title?: string
      participants?: string[]
      duration?: string
    }

    const prompt = `
Tu es un assistant de direction expert en rédaction de comptes-rendus de réunion professionnels.

**Réunion** : ${title ?? "Réunion"}
**Participants** : ${participants?.join(", ") ?? "Non renseignés"}
**Durée** : ${duration ?? "Non renseignée"}

**Transcription brute** :
${transcript}

Rédige un compte-rendu structuré en français comprenant :
1. **Résumé exécutif** (3-4 phrases max)
2. **Points discutés** (liste détaillée)
3. **Décisions prises**
4. **Actions à suivre** (avec responsable si mentionné)
5. **Prochaines étapes**

Sois concis, professionnel, et capture fidèlement les points essentiels.
`.trim()

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    })

    return NextResponse.json({
      summary: completion.choices[0].message.content,
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Internal error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
