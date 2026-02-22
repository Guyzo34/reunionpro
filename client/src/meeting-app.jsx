import { useState, useEffect, useRef, useCallback } from "react";

// ── Palette & design tokens ──────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:       #0a0d14;
    --surface:  #111520;
    --card:     #171c2e;
    --border:   #252c45;
    --accent:   #3d6fff;
    --accent2:  #00d4aa;
    --danger:   #ff4757;
    --warn:     #ffa502;
    --text:     #e8ecf5;
    --muted:    #6b7595;
    --font-h:   'Syne', sans-serif;
    --font-b:   'DM Sans', sans-serif;
  }

  body { background: var(--bg); color: var(--text); font-family: var(--font-b); min-height: 100vh; }

  /* ── animations ── */
  @keyframes fadeUp   { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:none; } }
  @keyframes pulse    { 0%,100% { opacity:1; } 50% { opacity:.4; } }
  @keyframes spin     { to { transform:rotate(360deg); } }
  @keyframes ripple   { to { transform:scale(4); opacity:0; } }
  @keyframes glow     { 0%,100% { box-shadow: 0 0 16px #3d6fff44; } 50% { box-shadow: 0 0 32px #3d6fff88; } }

  .fade-up  { animation: fadeUp .5s ease both; }
  .delay-1  { animation-delay:.1s; }
  .delay-2  { animation-delay:.2s; }
  .delay-3  { animation-delay:.3s; }
  .delay-4  { animation-delay:.4s; }

  /* ── LANDING ── */
  .landing {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    position: relative;
    overflow: hidden;
  }
  .landing::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 80% 60% at 50% 10%, #1a2a5e55 0%, transparent 70%);
    pointer-events: none;
  }
  .landing-grid {
    position: absolute; inset: 0;
    background-image: linear-gradient(var(--border) 1px, transparent 1px),
                      linear-gradient(90deg, var(--border) 1px, transparent 1px);
    background-size: 48px 48px;
    opacity: .18;
  }
  .logo {
    font-family: var(--font-h);
    font-size: 1rem;
    font-weight: 800;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 3.5rem;
  }
  .hero-title {
    font-family: var(--font-h);
    font-size: clamp(2.5rem, 6vw, 4.5rem);
    font-weight: 800;
    line-height: 1.05;
    text-align: center;
    background: linear-gradient(135deg, #fff 30%, #3d6fff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    max-width: 680px;
    margin-bottom: 1rem;
  }
  .hero-sub {
    font-size: 1.05rem;
    color: var(--muted);
    text-align: center;
    margin-bottom: 3rem;
    max-width: 480px;
    line-height: 1.6;
  }
  .cards-row {
    display: flex;
    gap: 1.25rem;
    flex-wrap: wrap;
    justify-content: center;
    max-width: 700px;
    width: 100%;
    z-index: 1;
  }
  .card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 2rem;
    flex: 1;
    min-width: 240px;
    max-width: 320px;
    cursor: pointer;
    transition: transform .2s, border-color .2s, box-shadow .2s;
    position: relative;
    overflow: hidden;
  }
  .card::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    border-radius: 20px 20px 0 0;
  }
  .card.create::after { background: linear-gradient(90deg, var(--accent), var(--accent2)); }
  .card.join::after   { background: linear-gradient(90deg, var(--accent2), var(--accent)); }
  .card:hover { transform: translateY(-4px); border-color: var(--accent); box-shadow: 0 12px 40px #3d6fff22; }
  .card-icon {
    width: 48px; height: 48px;
    background: #1e2740;
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.4rem;
    margin-bottom: 1rem;
  }
  .card h3 { font-family: var(--font-h); font-size: 1.2rem; font-weight: 700; margin-bottom: .4rem; }
  .card p  { font-size: .875rem; color: var(--muted); line-height: 1.5; }

  /* ── FORM OVERLAY ── */
  .overlay {
    position: fixed; inset: 0;
    background: #000b;
    backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center;
    z-index: 100;
    animation: fadeUp .25s ease both;
  }
  .modal {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 24px;
    padding: 2.5rem;
    width: min(480px, 90vw);
  }
  .modal h2 { font-family: var(--font-h); font-size: 1.5rem; font-weight: 700; margin-bottom: .5rem; }
  .modal p  { font-size: .875rem; color: var(--muted); margin-bottom: 2rem; }

  .field { margin-bottom: 1.25rem; }
  .field label { display: block; font-size: .8rem; font-weight: 500; color: var(--muted); margin-bottom: .5rem; letter-spacing: .05em; text-transform: uppercase; }
  .field input {
    width: 100%;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: .85rem 1.1rem;
    color: var(--text);
    font-family: var(--font-b);
    font-size: .95rem;
    outline: none;
    transition: border-color .2s;
  }
  .field input:focus { border-color: var(--accent); }

  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: .5rem;
    padding: .85rem 1.5rem;
    border-radius: 12px;
    border: none;
    font-family: var(--font-b);
    font-size: .95rem;
    font-weight: 500;
    cursor: pointer;
    transition: transform .15s, opacity .15s;
    position: relative;
    overflow: hidden;
  }
  .btn:active { transform: scale(.97); }
  .btn-primary {
    background: linear-gradient(135deg, var(--accent), #5a85ff);
    color: #fff;
    width: 100%;
    animation: glow 2.5s ease infinite;
  }
  .btn-secondary {
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--text);
    width: 100%;
  }
  .btn-icon {
    width: 48px; height: 48px; border-radius: 14px;
    font-size: 1.1rem;
    flex-shrink: 0;
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--text);
  }
  .btn-icon.active { background: var(--accent); border-color: var(--accent); color: #fff; }
  .btn-icon.danger { background: var(--danger); border-color: var(--danger); color: #fff; }
  .btn-icon.warn   { background: var(--warn); border-color: var(--warn); color: #000; }
  .btn-icon:hover  { opacity: .85; transform: translateY(-2px); }
  .btn-row { display: flex; gap: .75rem; margin-top: 1.5rem; }

  /* ── WAITING ROOM ── */
  .waiting {
    min-height: 100vh;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 2rem; gap: 2rem;
  }
  .preview-wrap {
    position: relative;
    width: min(420px, 90vw);
    aspect-ratio: 4/3;
    background: var(--card);
    border-radius: 20px;
    overflow: hidden;
    border: 1px solid var(--border);
  }
  .preview-wrap video { width: 100%; height: 100%; object-fit: cover; transform: scaleX(-1); }
  .preview-overlay {
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    background: var(--card);
    flex-direction: column; gap: .75rem;
    color: var(--muted); font-size: .9rem;
  }
  .preview-overlay span { font-size: 2.5rem; }
  .preview-badge {
    position: absolute; top: 12px; right: 12px;
    background: #000a;
    border-radius: 8px;
    padding: .35rem .7rem;
    font-size: .75rem;
    font-weight: 500;
    display: flex; align-items: center; gap: .4rem;
  }
  .dot-live { width: 7px; height: 7px; border-radius: 50%; background: var(--accent2); animation: pulse 1.5s infinite; }

  /* ── ROOM ── */
  .room {
    height: 100vh;
    display: flex; flex-direction: column;
    background: var(--bg);
  }
  .room-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: .9rem 1.5rem;
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
  }
  .room-name { font-family: var(--font-h); font-weight: 700; font-size: 1rem; }
  .room-time { font-size: .8rem; color: var(--muted); }
  .rec-badge {
    display: flex; align-items: center; gap: .5rem;
    background: #ff475722;
    border: 1px solid #ff4757;
    border-radius: 8px;
    padding: .3rem .8rem;
    font-size: .8rem;
    color: var(--danger);
    font-weight: 600;
  }

  /* Grid */
  .grid {
    flex: 1;
    display: grid;
    gap: 8px;
    padding: 1rem;
    overflow: auto;
  }
  .grid[data-count="1"] { grid-template-columns: 1fr; }
  .grid[data-count="2"] { grid-template-columns: 1fr 1fr; }
  .grid[data-count="3"] { grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; }
  .grid[data-count="4"] { grid-template-columns: 1fr 1fr; }

  .tile {
    background: var(--card);
    border-radius: 16px;
    position: relative;
    overflow: hidden;
    border: 2px solid transparent;
    transition: border-color .2s;
  }
  .tile.speaking { border-color: var(--accent2); }
  .tile video { width: 100%; height: 100%; object-fit: cover; transform: scaleX(-1); display: block; }
  .tile-avatar {
    position: absolute; inset: 0;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: .5rem; color: var(--muted);
  }
  .avatar-circle {
    width: 72px; height: 72px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-h); font-size: 1.6rem; font-weight: 700; color: #fff;
  }
  .tile-name {
    position: absolute; bottom: 10px; left: 10px;
    background: #000b;
    border-radius: 8px;
    padding: .3rem .6rem;
    font-size: .8rem;
    font-weight: 500;
    display: flex; align-items: center; gap: .4rem;
  }
  .tile-muted { font-size: .75rem; color: var(--danger); }

  /* Controls */
  .controls {
    display: flex; align-items: center; justify-content: center; gap: .75rem;
    padding: 1rem 1.5rem;
    background: var(--surface);
    border-top: 1px solid var(--border);
    flex-shrink: 0;
    flex-wrap: wrap;
  }
  .controls-sep { width: 1px; height: 32px; background: var(--border); margin: 0 .25rem; }

  /* Share panel */
  .share-panel {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 1.5rem;
    margin: 0 1.5rem 1rem;
    display: flex; align-items: center; gap: 1rem;
    flex-wrap: wrap;
    animation: fadeUp .3s ease both;
  }
  .share-link {
    flex: 1;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: .7rem 1rem;
    font-size: .85rem;
    color: var(--muted);
    min-width: 200px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .btn-copy {
    background: var(--accent);
    border: none; border-radius: 10px;
    padding: .7rem 1.2rem;
    color: #fff; font-family: var(--font-b); font-size: .875rem; font-weight: 500;
    cursor: pointer; white-space: nowrap;
    transition: opacity .15s;
  }
  .btn-copy:hover { opacity: .85; }

  /* Summary screen */
  .summary {
    min-height: 100vh;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 2rem;
  }
  .summary-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 24px;
    padding: 2.5rem;
    width: min(600px, 90vw);
    animation: fadeUp .4s ease both;
  }
  .summary-card h2 { font-family: var(--font-h); font-size: 1.5rem; font-weight: 700; margin-bottom: .4rem; }
  .summary-card .meta { font-size: .85rem; color: var(--muted); margin-bottom: 2rem; }
  .transcript-box {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 1.5rem;
    max-height: 300px;
    overflow-y: auto;
    margin-bottom: 1.5rem;
    font-size: .875rem;
    line-height: 1.7;
    color: #c5cce0;
  }
  .transcript-line { margin-bottom: .75rem; }
  .transcript-speaker { font-weight: 600; color: var(--accent); margin-right: .5rem; }
  .loading-bar {
    height: 4px;
    background: var(--surface);
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 1rem;
  }
  .loading-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--accent), var(--accent2));
    border-radius: 4px;
    transition: width .4s ease;
  }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

  /* Toast */
  .toast {
    position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%);
    background: var(--accent);
    color: #fff;
    padding: .8rem 1.5rem;
    border-radius: 12px;
    font-size: .9rem;
    font-weight: 500;
    z-index: 999;
    animation: fadeUp .3s ease both;
    box-shadow: 0 8px 24px #3d6fff44;
  }
`;

// ── Helpers ──────────────────────────────────────────────────────────────────
const randomId = () => Math.random().toString(36).slice(2, 8).toUpperCase();
const randomColor = (name) => {
  const colors = ["#3d6fff","#00d4aa","#ff6b6b","#a29bfe","#fd79a8","#fdcb6e","#6c5ce7","#00cec9"];
  let h = 0; for (let c of name) h += c.charCodeAt(0);
  return colors[h % colors.length];
};

const FAKE_PARTICIPANTS = [
  { id: "p1", name: "Kouassi Martin", muted: false, cam: true },
  { id: "p2", name: "Aïcha Traoré",   muted: true,  cam: false },
  { id: "p3", name: "Jean-Paul Brou", muted: false, cam: true  },
];

const FAKE_TRANSCRIPT = [
  { speaker: "Kouassi Martin", text: "Bonjour à tous, merci d'être présents. Commençons par le point sur le partenariat commercial." },
  { speaker: "Aïcha Traoré",   text: "Merci. De notre côté, nous avons finalisé les termes du contrat. Il reste deux clauses à discuter." },
  { speaker: "Jean-Paul Brou", text: "D'accord, je propose qu'on commence par la clause de confidentialité, qui est la plus sensible." },
  { speaker: "Kouassi Martin", text: "Tout à fait. Nous souhaitons élargir la portée géographique de la clause à toute l'Afrique de l'Ouest." },
  { speaker: "Aïcha Traoré",   text: "C'est acceptable de notre côté, sous réserve de préciser les délais de prescription." },
];

// ── Components ───────────────────────────────────────────────────────────────
function Toast({ msg, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2500); return () => clearTimeout(t); }, []);
  return <div className="toast">{msg}</div>;
}

function VideoTile({ participant, localStream, isLocal }) {
  const vRef = useRef();
  useEffect(() => {
    if (localStream && vRef.current) { vRef.current.srcObject = localStream; }
  }, [localStream]);

  const [speaking, setSpeaking] = useState(false);
  useEffect(() => {
    if (!isLocal) {
      const i = setInterval(() => setSpeaking(Math.random() > .7), 2000);
      return () => clearInterval(i);
    }
  }, [isLocal]);

  const color = randomColor(participant.name);
  const initials = participant.name.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase();

  return (
    <div className={`tile${speaking || isLocal ? " speaking" : ""}`}>
      {isLocal && localStream ? (
        <video ref={vRef} autoPlay muted playsInline />
      ) : (
        <div className="tile-avatar">
          {participant.cam ? (
            <div style={{ width:"100%", height:"100%", background: color+"22", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <div className="avatar-circle" style={{ background: color }}>{initials}</div>
            </div>
          ) : (
            <>
              <div className="avatar-circle" style={{ background: color }}>{initials}</div>
              <span style={{ fontSize:".8rem", color:"var(--muted)" }}>Caméra désactivée</span>
            </>
          )}
        </div>
      )}
      <div className="tile-name">
        {participant.name} {isLocal && "(Moi)"}
        {participant.muted && <span className="tile-muted">🎙️✕</span>}
      </div>
    </div>
  );
}

// ── SCREENS ──────────────────────────────────────────────────────────────────
function Landing({ onAction }) {
  return (
    <div className="landing">
      <div className="landing-grid" />
      <div className="logo fade-up">● ReunionPro</div>
      <h1 className="hero-title fade-up delay-1">Réunissez-vous.<br/>Sans frontières.</h1>
      <p className="hero-sub fade-up delay-2">
        Créez une salle en un clic, partagez le lien via WhatsApp et démarrez votre réunion immédiatement.
      </p>
      <div className="cards-row fade-up delay-3">
        <div className="card create" onClick={() => onAction("create")}>
          <div className="card-icon">🎬</div>
          <h3>Nouvelle réunion</h3>
          <p>Créez une salle instantanément et invitez vos partenaires via un lien WhatsApp.</p>
        </div>
        <div className="card join" onClick={() => onAction("join")}>
          <div className="card-icon">🔗</div>
          <h3>Rejoindre</h3>
          <p>Vous avez reçu un lien ou un code ? Rejoignez la salle en quelques secondes.</p>
        </div>
      </div>
    </div>
  );
}

function CreateModal({ onClose, onStart }) {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const code = useRef(randomId()).current;
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>Nouvelle réunion</h2>
        <p>Code de salle : <strong style={{ color:"var(--accent)" }}>{code}</strong></p>
        <div className="field">
          <label>Votre nom</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Kouassi Martin" />
        </div>
        <div className="field">
          <label>Titre de la réunion</label>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Point partenariat Q2" />
        </div>
        <div className="btn-row">
          <button className="btn btn-secondary" onClick={onClose}>Annuler</button>
          <button
            className="btn btn-primary"
            disabled={!name.trim()}
            onClick={() => onStart({ name, title, code })}
          >🎬 Créer la salle</button>
        </div>
      </div>
    </div>
  );
}

function JoinModal({ onClose, onStart }) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>Rejoindre une réunion</h2>
        <p>Entrez le code que vous avez reçu par WhatsApp.</p>
        <div className="field">
          <label>Votre nom</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Aïcha Traoré" />
        </div>
        <div className="field">
          <label>Code de la salle</label>
          <input
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            placeholder="Ex: ABC123"
            style={{ letterSpacing:"3px", fontFamily:"monospace", fontSize:"1.1rem" }}
          />
        </div>
        <div className="btn-row">
          <button className="btn btn-secondary" onClick={onClose}>Annuler</button>
          <button
            className="btn btn-primary"
            disabled={!name.trim() || code.length < 4}
            onClick={() => onStart({ name, code })}
          >🔗 Rejoindre</button>
        </div>
      </div>
    </div>
  );
}

function WaitingRoom({ session, onEnter }) {
  const vRef = useRef();
  const [stream, setStream] = useState(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  useEffect(() => {
    navigator.mediaDevices?.getUserMedia({ video: true, audio: true })
      .then(s => { setStream(s); if (vRef.current) vRef.current.srcObject = s; })
      .catch(() => {});
    return () => stream?.getTracks().forEach(t => t.stop());
  }, []);

  return (
    <div className="waiting">
      <div className="logo fade-up">● ReunionPro</div>
      <div className="preview-wrap fade-up delay-1">
        {stream && camOn ? (
          <video ref={vRef} autoPlay muted playsInline />
        ) : (
          <div className="preview-overlay">
            <span>📷</span>
            <p>{stream ? "Caméra désactivée" : "Accès caméra requis"}</p>
          </div>
        )}
        <div className="preview-badge">
          <div className="dot-live" />
          Aperçu
        </div>
      </div>
      <div style={{ display:"flex", gap:".75rem" }} className="fade-up delay-2">
        <button className={`btn btn-icon${micOn ? " active" : ""}`} onClick={() => setMicOn(!micOn)}>
          {micOn ? "🎙️" : "🔇"}
        </button>
        <button className={`btn btn-icon${camOn ? " active" : ""}`} onClick={() => setCamOn(!camOn)}>
          {camOn ? "📹" : "🚫"}
        </button>
      </div>
      <div style={{ textAlign:"center" }} className="fade-up delay-3">
        <h2 style={{ fontFamily:"var(--font-h)", marginBottom:".4rem" }}>
          {session.title || "Réunion en attente"}
        </h2>
        <p style={{ color:"var(--muted)", fontSize:".9rem", marginBottom:"1.5rem" }}>
          Bonjour, <strong>{session.name}</strong> — tout est prêt ?
        </p>
        <button className="btn btn-primary" style={{ minWidth:200 }} onClick={() => onEnter(stream, camOn, micOn)}>
          Rejoindre maintenant →
        </button>
      </div>
    </div>
  );
}

function Room({ session, localStream, camOn: initCam, micOn: initMic, onLeave }) {
  const [micOn, setMicOn]       = useState(initMic);
  const [camOn, setCamOn]       = useState(initCam);
  const [recording, setRec]     = useState(false);
  const [elapsed, setElapsed]   = useState(0);
  const [showShare, setShare]   = useState(false);
  const [toast, setToast]       = useState(null);
  const [participants]          = useState(FAKE_PARTICIPANTS);

  const meetingLink = `https://reunionpro.app/join/${session.code}`;
  const waLink      = `https://wa.me/?text=${encodeURIComponent(`🎬 Rejoignez notre réunion "${session.title || 'Réunion'}" :\n${meetingLink}\nCode : ${session.code}`)}`;

  useEffect(() => {
    const i = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(i);
  }, []);

  const fmt = (s) => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  const allParticipants = [
    { id: "me", name: session.name, muted: !micOn, cam: camOn },
    ...participants
  ];

  const count = allParticipants.length;

  return (
    <div className="room">
      {/* Header */}
      <div className="room-header">
        <div>
          <div className="room-name">{session.title || "Réunion"}</div>
          <div className="room-time">Code : {session.code} · {fmt(elapsed)}</div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:".75rem" }}>
          {recording && (
            <div className="rec-badge">
              <div className="dot-live" style={{ background:"var(--danger)" }} />
              REC
            </div>
          )}
          <span style={{ fontSize:".85rem", color:"var(--muted)" }}>
            {count} participant{count > 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Share panel */}
      {showShare && (
        <div className="share-panel">
          <span style={{ fontSize:"1.4rem" }}>🔗</span>
          <div className="share-link">{meetingLink}</div>
          <button className="btn-copy" onClick={() => { navigator.clipboard?.writeText(meetingLink); setToast("Lien copié !"); }}>
            Copier
          </button>
          <a href={waLink} target="_blank" rel="noreferrer">
            <button className="btn-copy" style={{ background:"#25D366", display:"flex", alignItems:"center", gap:".4rem" }}>
              <span>📱</span> WhatsApp
            </button>
          </a>
        </div>
      )}

      {/* Video grid */}
      <div className="grid" data-count={Math.min(count, 4)}>
        {allParticipants.slice(0, 4).map((p, i) => (
          <VideoTile
            key={p.id}
            participant={p}
            localStream={i === 0 ? localStream : null}
            isLocal={i === 0}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="controls">
        <button className={`btn btn-icon${micOn ? " active" : ""}`} title="Micro" onClick={() => setMicOn(!micOn)}>
          {micOn ? "🎙️" : "🔇"}
        </button>
        <button className={`btn btn-icon${camOn ? " active" : ""}`} title="Caméra" onClick={() => setCamOn(!camOn)}>
          {camOn ? "📹" : "🚫"}
        </button>
        <div className="controls-sep" />
        <button className="btn btn-icon" title="Partager écran" onClick={() => setToast("Partage d'écran — à connecter")}>
          🖥️
        </button>
        <button className={`btn btn-icon${showShare ? " active" : ""}`} title="Inviter" onClick={() => setShare(!showShare)}>
          🔗
        </button>
        <button className="btn btn-icon" title="Chat" onClick={() => setToast("Chat — à connecter")}>
          💬
        </button>
        <div className="controls-sep" />
        <button
          className={`btn btn-icon${recording ? " warn" : ""}`}
          title={recording ? "Arrêter l'enregistrement" : "Enregistrer"}
          onClick={() => { setRec(!recording); setToast(recording ? "Enregistrement arrêté" : "Enregistrement démarré"); }}
        >
          {recording ? "⏹️" : "⏺️"}
        </button>
        <div className="controls-sep" />
        <button className="btn btn-icon danger" title="Quitter" onClick={onLeave}>📵</button>
      </div>

      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
    </div>
  );
}

function Summary({ session, onRestart }) {
  const [progress, setProgress] = useState(0);
  const [done, setDone]         = useState(false);

  useEffect(() => {
    const steps = [20, 50, 80, 100];
    let i = 0;
    const t = setInterval(() => {
      setProgress(steps[i]);
      if (++i >= steps.length) { clearInterval(t); setTimeout(() => setDone(true), 400); }
    }, 800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="summary">
      <div className="summary-card">
        <h2>📋 Compte-rendu de réunion</h2>
        <div className="meta">
          Réunion : {session.title || "Sans titre"} · Code : {session.code} · Animé par {session.name}
        </div>

        {!done ? (
          <>
            <p style={{ fontSize:".9rem", color:"var(--muted)", marginBottom:"1rem" }}>
              🤖 Transcription et analyse en cours…
            </p>
            <div className="loading-bar">
              <div className="loading-fill" style={{ width:`${progress}%` }} />
            </div>
            <p style={{ fontSize:".8rem", color:"var(--muted)" }}>
              {progress < 50 ? "Traitement audio par Whisper…" : progress < 100 ? "Génération du compte-rendu par IA…" : "Finalisation…"}
            </p>
          </>
        ) : (
          <>
            <div className="transcript-box">
              {FAKE_TRANSCRIPT.map((l, i) => (
                <div key={i} className="transcript-line">
                  <span className="transcript-speaker">{l.speaker} :</span>
                  {l.text}
                </div>
              ))}
            </div>
            <div style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: "1.25rem",
              marginBottom: "1.5rem",
              fontSize: ".875rem",
              lineHeight: 1.7
            }}>
              <strong style={{ color:"var(--accent2)", display:"block", marginBottom:".5rem" }}>
                📌 Résumé IA
              </strong>
              La réunion a porté sur le partenariat commercial et l'examen des clauses contractuelles. Les parties ont convenu d'élargir la clause de confidentialité à l'Afrique de l'Ouest sous réserve de préciser les délais de prescription.
              <br/><br/>
              <strong style={{ color:"var(--warn)" }}>Actions à suivre :</strong><br/>
              — Finaliser les délais de prescription (Aïcha Traoré)<br/>
              — Rédiger l'avenant géographique (Jean-Paul Brou)<br/>
              — Validation finale en réunion de suivi.
            </div>
            <div style={{ display:"flex", gap:".75rem", flexWrap:"wrap" }}>
              <button className="btn btn-primary" style={{ flex:1 }}
                onClick={() => setToast?.("Export PDF — à connecter")}>
                📄 Exporter PDF
              </button>
              <button className="btn btn-secondary" style={{ flex:1 }} onClick={onRestart}>
                🏠 Accueil
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── App Shell ────────────────────────────────────────────────────────────────
export default function App() {
  const [screen,  setScreen]  = useState("landing");   // landing | waiting | room | summary
  const [modal,   setModal]   = useState(null);        // create | join | null
  const [session, setSession] = useState(null);
  const [stream,  setStream]  = useState(null);
  const [camOn,   setCamOn]   = useState(true);
  const [micOn,   setMicOn]   = useState(true);

  const handleAction = (type) => setModal(type);

  const handleStart = (data) => {
    setSession(data);
    setModal(null);
    setScreen("waiting");
  };

  const handleEnter = (s, cam, mic) => {
    setStream(s);
    setCamOn(cam);
    setMicOn(mic);
    setScreen("room");
  };

  const handleLeave = () => {
    stream?.getTracks().forEach(t => t.stop());
    setScreen("summary");
  };

  const handleRestart = () => {
    setSession(null);
    setStream(null);
    setScreen("landing");
  };

  return (
    <>
      <style>{css}</style>

      {screen === "landing"  && <Landing onAction={handleAction} />}
      {screen === "waiting"  && <WaitingRoom session={session} onEnter={handleEnter} />}
      {screen === "room"     && (
        <Room
          session={session}
          localStream={stream}
          camOn={camOn}
          micOn={micOn}
          onLeave={handleLeave}
        />
      )}
      {screen === "summary"  && <Summary session={session} onRestart={handleRestart} />}

      {modal === "create" && <CreateModal onClose={() => setModal(null)} onStart={handleStart} />}
      {modal === "join"   && <JoinModal   onClose={() => setModal(null)} onStart={handleStart} />}
    </>
  );
}
