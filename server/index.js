// ─────────────────────────────────────────────────────────────
//  ReunionPro — Backend Express
//  Routes :
//   POST /api/rooms          → créer une salle Daily.co
//   POST /api/rooms/token    → générer un token participant
//   POST /api/transcribe     → transcrire un audio (Whisper)
//   POST /api/summary        → générer le compte-rendu (Claude/OpenAI)
// ─────────────────────────────────────────────────────────────
require("dotenv").config();
const express  = require("express");
const cors     = require("cors");
const multer   = require("multer");
const FormData = require("form-data");
const fetch    = (...args) => import("node-fetch").then(({default: f}) => f(...args));
const OpenAI   = require("openai");
const fs       = require("fs");
const path     = require("path");

const app    = express();
const upload = multer({ dest: "uploads/" });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors({ origin: "*" }));
app.use(express.json());

const DAILY_API  = "https://api.daily.co/v1";
const DAILY_KEY  = process.env.DAILY_API_KEY;

const dailyHeaders = {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${DAILY_KEY}`,
};

// ── Créer une salle ──────────────────────────────────────────
app.post("/api/rooms", async (req, res) => {
  try {
    const { roomName, title } = req.body;

    const response = await fetch(`${DAILY_API}/rooms`, {
      method : "POST",
      headers: dailyHeaders,
      body   : JSON.stringify({
        name      : roomName,
        privacy   : "private",
        properties: {
          enable_recording: "cloud",         // enregistrement cloud
          enable_chat     : true,
          enable_screenshare: true,
          exp             : Math.floor(Date.now() / 1000) + 60 * 60 * 4, // expire dans 4h
          max_participants: 20,
          start_audio_off : false,
          start_video_off : false,
          lang            : "fr",
        },
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(response.status).json({ error: err });
    }

    const room = await response.json();
    res.json({ url: room.url, name: room.name, title });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// ── Générer un token participant ─────────────────────────────
app.post("/api/rooms/token", async (req, res) => {
  try {
    const { roomName, userName, isOwner } = req.body;

    const response = await fetch(`${DAILY_API}/meeting-tokens`, {
      method : "POST",
      headers: dailyHeaders,
      body   : JSON.stringify({
        properties: {
          room_name  : roomName,
          user_name  : userName,
          is_owner   : !!isOwner,
          enable_recording: isOwner ? "cloud" : undefined,
          exp        : Math.floor(Date.now() / 1000) + 60 * 60 * 4,
        },
      }),
    });

    const data = await response.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Lister les enregistrements d'une salle ───────────────────
app.get("/api/rooms/:roomName/recordings", async (req, res) => {
  try {
    const response = await fetch(
      `${DAILY_API}/recordings?room_name=${req.params.roomName}`,
      { headers: dailyHeaders }
    );
    const data = await response.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Transcrire un fichier audio via Whisper ──────────────────
app.post("/api/transcribe", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Pas de fichier audio" });

    const transcription = await openai.audio.transcriptions.create({
      file    : fs.createReadStream(req.file.path),
      model   : "whisper-1",
      language: "fr",
      response_format: "verbose_json",       // retourne les timestamps par segment
    });

    // Nettoyer le fichier temporaire
    fs.unlinkSync(req.file.path);

    res.json({
      text    : transcription.text,
      segments: transcription.segments,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// ── Générer un compte-rendu ──────────────────────────────────
app.post("/api/summary", async (req, res) => {
  try {
    const { transcript, title, participants, duration } = req.body;

    const prompt = `
Tu es un assistant de direction expert en rédaction de comptes-rendus de réunion professionnels.

**Réunion** : ${title || "Réunion"}
**Participants** : ${participants?.join(", ") || "Non renseignés"}
**Durée** : ${duration || "Non renseignée"}

**Transcription brute** :
${transcript}

Rédige un compte-rendu structuré en français comprenant :
1. **Résumé exécutif** (3-4 phrases max)
2. **Points discutés** (liste détaillée)
3. **Décisions prises**
4. **Actions à suivre** (avec responsable si mentionné)
5. **Prochaines étapes**

Sois concis, professionnel, et capture fidèlement les points essentiels.
`;

    const completion = await openai.chat.completions.create({
      model   : "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    res.json({ summary: completion.choices[0].message.content });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// ── Health check ─────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    daily : !!DAILY_KEY,
    openai: !!process.env.OPENAI_API_KEY,
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅  Serveur ReunionPro sur http://localhost:${PORT}`));
