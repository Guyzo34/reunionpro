import "./index.css";
import { useState, useEffect, useRef } from "react";
import DailyIframe from "@daily-co/daily-js";

const API = import.meta.env.VITE_API_URL || "https://reunionpro-production.up.railway.app/api";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg:#0a0d14; --surface:#111520; --card:#171c2e; --border:#252c45;
    --accent:#3d6fff; --accent2:#00d4aa; --danger:#ff4757; --warn:#ffa502;
    --text:#e8ecf5; --muted:#6b7595;
    --font-h:'Syne',sans-serif; --font-b:'DM Sans',sans-serif;
  }
  body { background:var(--bg); color:var(--text); font-family:var(--font-b); min-height:100vh; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
  @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:.3} }
  @keyframes glow   { 0%,100%{box-shadow:0 0 16px #3d6fff44} 50%{box-shadow:0 0 36px #3d6fff88} }
  .fu { animation:fadeUp .4s ease both; }
  .d1 { animation-delay:.1s; }
  .d2 { animation-delay:.2s; }
  .d3 { animation-delay:.3s; }
  ::-webkit-scrollbar{width:6px} ::-webkit-scrollbar-thumb{background:var(--border);border-radius:3px}
  @media print {
    * { background: #fff !important; color: #000 !important; box-shadow: none !important; border-color: #ccc !important; animation: none !important; }
    body { background: #fff !important; }
    button { display: none !important; }
    div[style*="linear-gradient"] { background: #fff !important; }
    strong { color: #000 !important; }
  }
`;

function Toast({ msg, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2500); return () => clearTimeout(t); }, []);
  return (
    <div style={{
      position:"fixed", bottom:"2rem", left:"50%", transform:"translateX(-50%)",
      background:"var(--accent)", color:"#fff", padding:".8rem 1.6rem",
      borderRadius:12, fontWeight:500, zIndex:999,
      animation:"fadeUp .3s ease both", boxShadow:"0 8px 24px #3d6fff44",
      whiteSpace:"nowrap",
    }}>{msg}</div>
  );
}

// ── LANDING ──────────────────────────────────────────────────
function Landing({ onAction }) {
  return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"2rem", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(#252c4528 1px,transparent 1px),linear-gradient(90deg,#252c4528 1px,transparent 1px)", backgroundSize:"48px 48px" }}/>
      <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 80% 50% at 50% 0%,#1a2a5e44,transparent 70%)" }}/>

      <div className="fu" style={{ fontFamily:"var(--font-h)", fontSize:".9rem", fontWeight:800, letterSpacing:"3px", textTransform:"uppercase", color:"var(--accent)", marginBottom:"3rem", zIndex:1 }}>
        ● ReunionPro
      </div>

      <h1 className="fu d1" style={{ fontFamily:"var(--font-h)", fontSize:"clamp(2.5rem,6vw,4.5rem)", fontWeight:800, lineHeight:1.05, textAlign:"center", background:"linear-gradient(135deg,#fff 30%,#3d6fff)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", maxWidth:640, marginBottom:"1rem", zIndex:1 }}>
        Réunissez-vous.<br/>Sans frontières.
      </h1>

      <p className="fu d2" style={{ color:"var(--muted)", textAlign:"center", maxWidth:440, lineHeight:1.65, marginBottom:"3rem", zIndex:1 }}>
        Créez une salle, invitez vos partenaires via WhatsApp, et obtenez un compte-rendu automatique.
      </p>

      <div className="fu d3" style={{ display:"flex", gap:"1.25rem", flexWrap:"wrap", justifyContent:"center", zIndex:1 }}>
        {[
          { key:"create", icon:"🎬", label:"Nouvelle réunion", desc:"Créez une salle sécurisée et invitez par WhatsApp.", color:"var(--accent)" },
          { key:"join",   icon:"🔗", label:"Rejoindre",        desc:"Entrez le code reçu par WhatsApp.", color:"var(--accent2)" },
        ].map(c => (
          <div key={c.key} onClick={() => onAction(c.key)}
            style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:20, padding:"2rem", width:280, cursor:"pointer", transition:"all .2s", position:"relative", overflow:"hidden" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor=c.color; e.currentTarget.style.transform="translateY(-4px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor="var(--border)"; e.currentTarget.style.transform="none"; }}
          >
            <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:c.color }}/>
            <div style={{ fontSize:"1.5rem", marginBottom:"1rem" }}>{c.icon}</div>
            <h3 style={{ fontFamily:"var(--font-h)", fontSize:"1.1rem", marginBottom:".4rem" }}>{c.label}</h3>
            <p style={{ fontSize:".875rem", color:"var(--muted)", lineHeight:1.55 }}>{c.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── INPUT ────────────────────────────────────────────────────
function Input({ label, value, onChange, placeholder, mono }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom:"1.25rem" }}>
      <label style={{ display:"block", fontSize:".78rem", color:"var(--muted)", marginBottom:".4rem", textTransform:"uppercase", letterSpacing:".05em" }}>{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ width:"100%", background:"var(--surface)", border:`1px solid ${focused?"var(--accent)":"var(--border)"}`, borderRadius:12, padding:".85rem 1rem", color:"var(--text)", fontFamily: mono?"monospace":"var(--font-b)", fontSize: mono?"1.1rem":".95rem", letterSpacing: mono?"3px":"normal", outline:"none", transition:"border-color .2s" }}
      />
    </div>
  );
}

// ── MODAL ────────────────────────────────────────────────────
function Modal({ title, sub, onClose, children }) {
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"#000b", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200 }}>
      <div onClick={e => e.stopPropagation()} style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:24, padding:"2.5rem", width:"min(460px,92vw)", animation:"fadeUp .25s ease both" }}>
        <h2 style={{ fontFamily:"var(--font-h)", fontSize:"1.4rem", fontWeight:700, marginBottom:".4rem" }}>{title}</h2>
        <p style={{ fontSize:".875rem", color:"var(--muted)", marginBottom:"2rem" }}>{sub}</p>
        {children}
      </div>
    </div>
  );
}

function Btn({ onClick, disabled, primary, danger, children }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      flex:1, padding:".85rem", borderRadius:12, cursor: disabled?"not-allowed":"pointer",
      fontFamily:"var(--font-b)", fontSize:".95rem", border:"none", opacity: disabled?.6:1,
      background: primary ? "linear-gradient(135deg,var(--accent),#5a85ff)" : danger ? "var(--danger)" : "var(--surface)",
      color: primary||danger ? "#fff" : "var(--text)",
      borderTop: primary||danger ? "none" : "1px solid var(--border)",
      borderLeft: primary||danger ? "none" : "1px solid var(--border)",
      borderRight: primary||danger ? "none" : "1px solid var(--border)",
      borderBottom: primary||danger ? "none" : "1px solid var(--border)",
      animation: primary ? "glow 2.5s ease infinite" : "none",
    }}>{children}</button>
  );
}

function ErrorBox({ msg }) {
  if (!msg) return null;
  return <div style={{ background:"#ff475720", border:"1px solid var(--danger)", borderRadius:10, padding:".75rem 1rem", color:"var(--danger)", fontSize:".85rem", marginBottom:"1rem" }}>⚠️ {msg}</div>;
}

// ── MODAL CRÉER ──────────────────────────────────────────────
function CreateModal({ onClose, onStart }) {
  const [name,  setName]   = useState("");
  const [title, setTitle]  = useState("");
  const [loading, setLoad] = useState(false);
  const [error, setError]  = useState(null);

  const submit = async () => {
    if (!name.trim()) return;
    setLoad(true); setError(null);
    try {
      const roomName = "rp-" + Math.random().toString(36).slice(2, 8);
      const r1 = await fetch(API + "/rooms", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ roomName, title }) });
      const room = await r1.json();
      if (room.error) throw new Error(JSON.stringify(room.error));
      const r2 = await fetch(API + "/rooms/token", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ roomName, userName: name, isOwner: true }) });
      const tok = await r2.json();
      if (tok.error) throw new Error(JSON.stringify(tok.error));
      onStart({ name, title, roomName, roomUrl: room.url, token: tok.token });
    } catch(e) { setError(e.message); } finally { setLoad(false); }
  };

  return (
    <Modal title="🎬 Nouvelle réunion" sub="Une salle sécurisée sera créée sur Daily.co" onClose={onClose}>
      <ErrorBox msg={error} />
      <Input label="Votre nom" value={name} onChange={setName} placeholder="Ex : Kouassi Martin" />
      <Input label="Titre de la réunion" value={title} onChange={setTitle} placeholder="Ex : Point partenariat Q2" />
      <div style={{ display:"flex", gap:".75rem", marginTop:"1.5rem" }}>
        <Btn onClick={onClose}>Annuler</Btn>
        <Btn primary onClick={submit} disabled={loading || !name.trim()}>{loading ? "Création…" : "Créer la salle →"}</Btn>
      </div>
    </Modal>
  );
}

// ── MODAL REJOINDRE ──────────────────────────────────────────
function JoinModal({ onClose, onStart }) {
  const [name, setName]    = useState("");
  const [code, setCode]    = useState(window._joinCode || "");
  const [loading, setLoad] = useState(false);
  const [error, setError]  = useState(null);

  const submit = async () => {
    if (!name.trim() || !code.trim()) return;
    setLoad(true); setError(null);
    try {
      const roomName = "rp-" + code.toLowerCase().replace("rp-","");
      const r = await fetch(API + "/rooms/token", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ roomName, userName: name, isOwner: false }) });
      const tok = await r.json();
      if (tok.error) throw new Error(JSON.stringify(tok.error));
      const roomUrl = tok.roomUrl || ("https://api.daily.co/" + roomName);
      onStart({ name, title:"Réunion", roomName, roomUrl, token: tok.token });
    } catch(e) { setError(e.message); } finally { setLoad(false); }
  };

  return (
    <Modal title="🔗 Rejoindre une réunion" sub="Entrez le code reçu par WhatsApp" onClose={onClose}>
      <ErrorBox msg={error} />
      <Input label="Votre nom" value={name} onChange={setName} placeholder="Ex : Aïcha Traoré" />
      <Input label="Code de la salle" value={code} onChange={setCode} placeholder="Ex : abc123" mono />
      <div style={{ display:"flex", gap:".75rem", marginTop:"1.5rem" }}>
        <Btn onClick={onClose}>Annuler</Btn>
        <Btn primary onClick={submit} disabled={loading || !name.trim() || !code.trim()}>{loading ? "Connexion…" : "Rejoindre →"}</Btn>
      </div>
    </Modal>
  );
}

// ── SALLE D'ATTENTE ──────────────────────────────────────────
function WaitingRoom({ session, onEnter }) {
  const vRef = useRef();
  const [stream, setStream] = useState(null);
  const [camOn, setCamOn]   = useState(true);
  const [micOn, setMicOn]   = useState(true);

  // Détecter WhatsApp Browser sur iOS
  const isWhatsAppBrowser = /WhatsApp/i.test(navigator.userAgent);
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

  useEffect(() => {
    navigator.mediaDevices?.getUserMedia({ video:true, audio:true })
      .then(s => { setStream(s); if (vRef.current) vRef.current.srcObject = s; })
      .catch(() => {});
  }, []);

  // Afficher un message pour ouvrir dans Safari sur WhatsApp iOS
  if (isWhatsAppBrowser && isIOS) {
    return (
      <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"2rem", gap:"1.5rem" }}>
        <div style={{ fontFamily:"var(--font-h)", fontWeight:800, fontSize:".9rem", letterSpacing:"3px", textTransform:"uppercase", color:"var(--accent)" }}>● ReunionPro</div>
        <div style={{ background:"var(--card)", border:"1px solid var(--warn)", borderRadius:20, padding:"2rem", maxWidth:340, textAlign:"center" }}>
          <div style={{ fontSize:"2.5rem", marginBottom:"1rem" }}>📱</div>
          <h3 style={{ fontFamily:"var(--font-h)", marginBottom:".75rem", color:"var(--warn)" }}>Ouvrir dans Safari</h3>
          <p style={{ fontSize:".9rem", color:"var(--muted)", lineHeight:1.6, marginBottom:"1.5rem" }}>
            Pour activer votre caméra et micro, ouvrez ce lien dans <strong style={{ color:"var(--text)" }}>Safari</strong> en appuyant sur <strong style={{ color:"var(--text)" }}>⋯ → Ouvrir dans Safari</strong>
          </p>
          <button onClick={onEnter} style={{ width:"100%", padding:".85rem", borderRadius:12, border:"none", background:"var(--surface)", color:"var(--muted)", fontFamily:"var(--font-b)", fontSize:".9rem", cursor:"pointer", borderTop:"1px solid var(--border)", borderLeft:"1px solid var(--border)", borderRight:"1px solid var(--border)", borderBottom:"1px solid var(--border)" }}>
            Continuer quand même →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"2rem", gap:"1.5rem" }}>
      <div className="fu" style={{ fontFamily:"var(--font-h)", fontWeight:800, fontSize:".9rem", letterSpacing:"3px", textTransform:"uppercase", color:"var(--accent)" }}>● ReunionPro</div>

      <div className="fu d1" style={{ position:"relative", width:"min(380px,90vw)", aspectRatio:"4/3", background:"var(--card)", border:"1px solid var(--border)", borderRadius:20, overflow:"hidden" }}>
        {stream && camOn
          ? <video ref={vRef} autoPlay muted playsInline style={{ width:"100%", height:"100%", objectFit:"cover", transform:"scaleX(-1)" }}/>
          : <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:".75rem", color:"var(--muted)" }}>
              <span style={{ fontSize:"2.5rem" }}>📷</span>
              <p style={{ fontSize:".9rem" }}>{stream ? "Caméra désactivée" : "Accès caméra…"}</p>
            </div>
        }
        <div style={{ position:"absolute", top:10, right:10, background:"#000a", borderRadius:8, padding:".3rem .7rem", fontSize:".75rem", display:"flex", alignItems:"center", gap:".4rem" }}>
          <div style={{ width:7, height:7, borderRadius:"50%", background:"var(--accent2)", animation:"pulse 1.4s infinite" }}/>
          Aperçu
        </div>
      </div>

      <div className="fu d2" style={{ display:"flex", gap:".75rem" }}>
        {[
          { on:micOn, set:setMicOn, onIcon:"🎙️", offIcon:"🔇" },
          { on:camOn, set:setCamOn, onIcon:"📹", offIcon:"🚫" },
        ].map((b, i) => (
          <button key={i} onClick={() => b.set(v => !v)} style={{ width:48, height:48, borderRadius:14, border:`1px solid ${b.on?"var(--accent)":"var(--border)"}`, background:b.on?"var(--accent)":"var(--surface)", fontSize:"1.1rem", cursor:"pointer" }}>
            {b.on ? b.onIcon : b.offIcon}
          </button>
        ))}
      </div>

      <div className="fu d3" style={{ textAlign:"center" }}>
        <h2 style={{ fontFamily:"var(--font-h)", marginBottom:".4rem" }}>{session.title || "Réunion"}</h2>
        <p style={{ color:"var(--muted)", fontSize:".9rem", marginBottom:"1.5rem" }}>
          Bonjour, <strong style={{ color:"var(--text)" }}>{session.name}</strong> — tout est prêt ?
        </p>
        <button onClick={onEnter} style={{ padding:".9rem 2.5rem", borderRadius:12, border:"none", background:"linear-gradient(135deg,var(--accent),#5a85ff)", color:"#fff", fontFamily:"var(--font-b)", fontSize:"1rem", cursor:"pointer", animation:"glow 2.5s ease infinite" }}>
          Rejoindre maintenant →
        </button>
      </div>
    </div>
  );
}

// ── SALLE DE RÉUNION ─────────────────────────────────────────
function Room({ session, onLeave }) {
  const containerRef  = useRef(null);
  const recorderRef   = useRef(null);
  const chunksRef     = useRef([]);
  const savedBlobRef  = useRef(null);

  const [ready,     setReady]   = useState(false);
  const [showShare, setShare]   = useState(false);
  const [recording, setRec]     = useState(false);
  const [elapsed,   setElapsed] = useState(0);
  const [toast,     setToast]   = useState(null);

  const code = session.roomName.replace("rp-","").toUpperCase();
  const publicUrl = "https://reunionpro.vercel.app";
  const dailyDirectUrl = "https://digbeu.daily.co/" + session.roomName + "?t=" + session.token;
  const link = publicUrl + "/join/" + code;
  const waLink = "https://wa.me/?text=" + encodeURIComponent("Rejoignez la réunion : " + (session.title||"Reunion") + "\n\nLien : " + link + "\nCode : " + code);

  // Démarrer l'enregistrement audio via le micro
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.start(1000);
      recorderRef.current = recorder;
      setRec(true);
      setToast("⏺️ Enregistrement démarré");
    } catch(e) {
      setToast("❌ Micro inaccessible");
    }
  };

  const stopRecording = () => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        savedBlobRef.current = blob;
      };
      recorderRef.current.stop();
      recorderRef.current.stream?.getTracks().forEach(t => t.stop());
    }
    setRec(false);
    setToast("⏹️ Enregistrement arrêté");
  };

  const handleLeave = () => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        onLeave(blob);
      };
      recorderRef.current.stop();
      recorderRef.current.stream?.getTracks().forEach(t => t.stop());
    } else {
      onLeave(savedBlobRef.current);
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Sur iOS Safari : rediriger vers Daily.co avec le token
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isWhatsApp = /WhatsApp/i.test(navigator.userAgent);
    if (isIOS && !isWhatsApp) {
      const dailyUrl = session.roomUrl + "?t=" + session.token;
      window.location.href = dailyUrl;
      return;
    }

    DailyIframe.getCallInstance()?.destroy();
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const frame = DailyIframe.createFrame(containerRef.current, {
      iframeStyle: { position:"absolute", top:0, left:0, width:"100%", height:"100%", border:"none", borderRadius:"12px" },
      showLeaveButton: false,
      showFullscreenButton: true,
      lang: "fr",
      activeSpeakerMode: false,
      allow: "camera; microphone; fullscreen; display-capture; autoplay",
    });
    frame.on("joined-meeting", () => {
      setReady(true);
      // Forcer le layout grille sur mobile avec intervenant actif en premier
      try {
        frame.setLayoutConfig({
          preset: isMobile ? "default" : "default",
          maxCamStreams: isMobile ? 9 : 25,
        });
      } catch(e) {}
    });
    frame.on("loaded",         () => setReady(true));
    frame.on("started-camera", () => setReady(true));
    frame.on("joining-meeting",() => setReady(true));
    const fallback = setTimeout(() => setReady(true), 2000);
    frame.join({ url: session.roomUrl, token: session.token, userName: session.name });
    return () => { clearTimeout(fallback); try { frame.leave(); frame.destroy(); } catch(e){} };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const t = setInterval(() => setElapsed(e => e+1), 1000);
    return () => clearInterval(t);
  }, [ready]);

  const fmt = s => String(Math.floor(s/60)).padStart(2,"0") + ":" + String(s%60).padStart(2,"0");

  return (
    <div style={{ height:"100vh", display:"flex", flexDirection:"column", background:"var(--bg)" }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:".9rem 1.5rem", background:"var(--surface)", borderBottom:"1px solid var(--border)", flexShrink:0 }}>
        <div>
          <div style={{ fontFamily:"var(--font-h)", fontWeight:700, fontSize:"1rem" }}>{session.title || "Réunion"}</div>
          <div style={{ fontSize:".8rem", color:"var(--muted)" }}>Code : {code} · {ready ? fmt(elapsed) : "Connexion…"}</div>
        </div>
        {recording && (
          <div style={{ display:"flex", alignItems:"center", gap:".45rem", background:"#ff475720", border:"1px solid var(--danger)", borderRadius:8, padding:".28rem .75rem", fontSize:".78rem", color:"var(--danger)", fontWeight:600 }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:"var(--danger)", animation:"pulse 1.4s infinite" }}/>REC
          </div>
        )}
      </div>

      {/* Barre de partage */}
      {showShare && (
        <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:16, padding:"1rem 1.5rem", margin:"8px 8px 0", display:"flex", alignItems:"center", gap:".75rem", flexWrap:"wrap", animation:"fadeUp .3s ease both", flexShrink:0 }}>
          <div style={{ flex:1, background:"var(--surface)", border:"1px solid var(--border)", borderRadius:10, padding:".65rem 1rem", fontSize:".83rem", color:"var(--muted)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", minWidth:180 }}>{link}</div>
          <button onClick={() => { navigator.clipboard?.writeText(link); setToast("✅ Lien copié !"); }} style={{ background:"var(--accent)", border:"none", borderRadius:10, padding:".65rem 1rem", color:"#fff", cursor:"pointer", fontFamily:"var(--font-b)", fontSize:".875rem" }}>Copier</button>
          <a href={waLink} target="_blank" rel="noreferrer">
            <button style={{ background:"#25D366", border:"none", borderRadius:10, padding:".65rem 1rem", color:"#fff", cursor:"pointer", fontFamily:"var(--font-b)", fontSize:".875rem" }}>📱 WhatsApp</button>
          </a>
        </div>
      )}

      {/* Vidéo */}
      <div ref={containerRef} style={{ flex:1, position:"relative", margin:"8px" }}>
        {!ready && (
          <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"1rem", zIndex:10, background:"var(--bg)", borderRadius:12 }}>
            <div style={{ fontSize:"2.5rem", animation:"pulse 1.2s infinite" }}>📡</div>
            <p style={{ color:"var(--muted)" }}>Connexion à la salle Daily.co…</p>
          </div>
        )}
      </div>

      {/* Contrôles */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:".75rem", padding:"1rem 1.5rem", background:"var(--surface)", borderTop:"1px solid var(--border)", flexShrink:0, flexWrap:"wrap" }}>
        <button onClick={() => setShare(v => !v)} style={{ height:44, padding:"0 1.1rem", borderRadius:12, border:`1px solid ${showShare?"var(--accent)":"var(--border)"}`, background:showShare?"var(--accent)":"var(--surface)", color:"#fff", cursor:"pointer", fontSize:".875rem" }}>
          🔗 Inviter
        </button>
        <button onClick={() => recording ? stopRecording() : startRecording()} style={{ height:44, padding:"0 1.1rem", borderRadius:12, border:`1px solid ${recording?"var(--warn)":"var(--border)"}`, background:recording?"var(--warn)":"var(--surface)", color:recording?"#000":"#fff", cursor:"pointer", fontSize:".875rem" }}>
          {recording ? "⏹️ Arrêter REC" : "⏺️ Enregistrer"}
        </button>
        <div style={{ width:1, height:30, background:"var(--border)" }}/>
        <button onClick={handleLeave} style={{ height:44, padding:"0 1.1rem", borderRadius:12, border:"1px solid var(--danger)", background:"var(--danger)", color:"#fff", cursor:"pointer", fontSize:".875rem" }}>
          📵 Quitter
        </button>
      </div>

      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
    </div>
  );
}

// ── COMPTE-RENDU (RÉEL) ──────────────────────────────────────
function Summary({ session, audioBlob, onRestart }) {
  const [step,       setStep]       = useState("transcribing"); // transcribing | summarizing | done | error
  const [transcript, setTranscript] = useState("");
  const [summary,    setSummary]    = useState("");
  const [error,      setError]      = useState(null);

  useEffect(() => {
    if (!audioBlob) {
      // Pas d'audio enregistré — afficher message
      setStep("no-audio");
      return;
    }
    runPipeline();
  }, []);

  const runPipeline = async () => {
    try {
      // 1. Transcription
      setStep("transcribing");
      const formData = new FormData();
      formData.append("audio", audioBlob, "reunion.webm");
      const r1 = await fetch(API + "/transcribe", { method:"POST", body: formData });
      if (!r1.ok) throw new Error("Erreur transcription : " + r1.status);
      const t = await r1.json();
      setTranscript(t.text);

      // 2. Compte-rendu IA
      setStep("summarizing");
      const r2 = await fetch(API + "/summary", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          transcript: t.text,
          title: session.title,
          participants: [session.name],
        })
      });
      if (!r2.ok) throw new Error("Erreur compte-rendu : " + r2.status);
      const s = await r2.json();
      setSummary(s.summary);
      setStep("done");
    } catch(e) {
      setError(e.message);
      setStep("error");
    }
  };

  const stepLabel = {
    transcribing: "Transcription audio en cours (Whisper)…",
    summarizing:  "Génération du compte-rendu avec GPT-4o…",
    done:         "Compte-rendu prêt ✅",
    error:        "Une erreur est survenue",
    "no-audio":   "Aucun enregistrement disponible",
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"2rem" }}>
      <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:24, padding:"2.5rem", width:"min(700px,92vw)", animation:"fadeUp .4s ease both" }}>
        <h2 style={{ fontFamily:"var(--font-h)", fontSize:"1.5rem", fontWeight:700, marginBottom:".4rem" }}>📋 Compte-rendu</h2>
        <p style={{ fontSize:".85rem", color:"var(--muted)", marginBottom:"1.5rem" }}>{session.title || "Réunion"} · Animé par {session.name}</p>

        {/* Statut */}
        {step !== "done" && (
          <div style={{ marginBottom:"1.5rem" }}>
            {(step === "transcribing" || step === "summarizing") && (
              <div style={{ height:4, background:"var(--surface)", borderRadius:4, overflow:"hidden", marginBottom:".75rem" }}>
                <div style={{ height:"100%", background:"linear-gradient(90deg,var(--accent),var(--accent2))", borderRadius:4, width: step==="transcribing" ? "50%" : "90%", transition:"width 1s ease" }}/>
              </div>
            )}
            <p style={{ fontSize:".875rem", color: step==="error" ? "var(--danger)" : "var(--muted)" }}>
              {step === "error" ? "❌ " + error : stepLabel[step]}
            </p>
          </div>
        )}

        {/* Transcription */}
        {transcript && (
          <div style={{ marginBottom:"1.5rem" }}>
            <p style={{ fontSize:".78rem", color:"var(--muted)", textTransform:"uppercase", letterSpacing:".05em", marginBottom:".5rem" }}>Transcription</p>
            <div style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:12, padding:"1rem", fontSize:".82rem", color:"#9aa3c0", lineHeight:1.7, maxHeight:160, overflowY:"auto" }}>
              {transcript}
            </div>
          </div>
        )}

        {/* Compte-rendu IA */}
        {step === "done" && summary && (
          <div style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:14, padding:"1.4rem", marginBottom:"1.5rem", fontSize:".875rem", lineHeight:1.85, color:"#c5cce0" }}>
            <strong style={{ color:"var(--accent2)", display:"block", marginBottom:".75rem" }}>📌 Résumé IA</strong>
            <div dangerouslySetInnerHTML={{ __html:
              summary
                .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
                .replace(/^---$/gm, "<hr style='border-color:#252c45;margin:.5rem 0'/>")
                .replace(/\n/g, "<br/>")
            }}/>
          </div>
        )}

        {/* Message pas d'audio */}
        {step === "no-audio" && (
          <div style={{ background:"#ffa50220", border:"1px solid var(--warn)", borderRadius:12, padding:"1rem", marginBottom:"1.5rem", fontSize:".875rem", color:"var(--warn)" }}>
            ⚠️ Aucun enregistrement audio détecté. Pour obtenir un compte-rendu, utilisez le bouton <strong>⏺️ Enregistrer</strong> pendant la réunion.
          </div>
        )}

        {/* Boutons */}
        <div style={{ display:"flex", gap:".75rem", flexWrap:"wrap" }}>
          {step === "done" && (
            <button onClick={() => window.print()} style={{ flex:1, padding:".85rem", borderRadius:12, border:"none", background:"linear-gradient(135deg,var(--accent),#5a85ff)", color:"#fff", cursor:"pointer", fontFamily:"var(--font-b)", fontSize:".95rem" }}>
              📄 Exporter PDF
            </button>
          )}
          {step === "error" && (
            <button onClick={runPipeline} style={{ flex:1, padding:".85rem", borderRadius:12, border:"none", background:"var(--warn)", color:"#000", cursor:"pointer", fontFamily:"var(--font-b)", fontSize:".95rem" }}>
              🔄 Réessayer
            </button>
          )}
          <button onClick={onRestart} style={{ flex:1, padding:".85rem", borderRadius:12, border:"1px solid var(--border)", background:"var(--surface)", color:"var(--text)", cursor:"pointer", fontFamily:"var(--font-b)", fontSize:".95rem" }}>
            🏠 Accueil
          </button>
        </div>
      </div>
    </div>
  );
}

// ── APP SHELL ────────────────────────────────────────────────
export default function App() {
  const [screen,    setScreen]    = useState("landing");
  const [modal,     setModal]     = useState(null);
  const [session,   setSession]   = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);

  // Détecter /join/CODE dans l'URL au chargement
  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/\/join\/([a-zA-Z0-9]+)/);
    if (match) {
      window._joinCode = match[1];
      setModal("join");
      window.history.replaceState({}, "", "/");
    }
  }, []);

  return (
    <>
      <style>{css}</style>
      {screen === "landing" && <Landing onAction={setModal} />}
      {screen === "waiting" && <WaitingRoom session={session} onEnter={() => setScreen("room")} />}
      {screen === "room"    && (
        <Room
          session={session}
          onLeave={blob => { setAudioBlob(blob); setScreen("summary"); }}
        />
      )}
      {screen === "summary" && (
        <Summary
          session={session}
          audioBlob={audioBlob}
          onRestart={() => { setSession(null); setAudioBlob(null); setScreen("landing"); }}
        />
      )}
      {modal === "create" && <CreateModal onClose={() => setModal(null)} onStart={d => { setSession(d); setModal(null); setScreen("waiting"); }} />}
      {modal === "join"   && <JoinModal   onClose={() => setModal(null)} onStart={d => { setSession(d); setModal(null); setScreen("waiting"); }} />}
    </>
  );
}
