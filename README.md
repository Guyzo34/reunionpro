# 🎬 ReunionPro — Application de Visioconférence

Application complète de réunion vidéo avec :
- **Visioconférence multi-participants** via Daily.co (WebRTC)
- **Partage de lien WhatsApp** pour inviter les partenaires
- **Enregistrement cloud** de la réunion
- **Transcription automatique** via OpenAI Whisper
- **Compte-rendu IA** généré automatiquement

---

## 📋 Prérequis

- Node.js 18+ installé
- Un compte **Daily.co** (gratuit) → https://dashboard.daily.co
- Un compte **OpenAI** avec crédit → https://platform.openai.com

---

## 🚀 Installation en 5 étapes

### 1. Récupérer vos clés API

**Daily.co :**
1. Créer un compte sur https://dashboard.daily.co
2. Aller dans **Developers** → **API keys**
3. Copier votre clé API

**OpenAI :**
1. Aller sur https://platform.openai.com/api-keys
2. Créer une nouvelle clé API
3. Copier votre clé

---

### 2. Configurer le backend

```bash
cd server
cp .env.example .env
```

Ouvrez `.env` et remplissez :
```
DAILY_API_KEY=d8xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PORT=4000
```

Installez les dépendances :
```bash
npm install
```

---

### 3. Démarrer le backend

```bash
# Dans le dossier server/
npm start
# ou en mode développement avec auto-reload :
npm run dev
```

Vous devriez voir :
```
✅  Serveur ReunionPro sur http://localhost:4000
```

Vérification : http://localhost:4000/api/health

---

### 4. Configurer et démarrer le frontend

Dans un **nouveau terminal** :
```bash
cd client
npm install
npm run dev
```

L'application est disponible sur : **http://localhost:3000**

---

### 5. Utiliser l'application

1. Ouvrez http://localhost:3000
2. Cliquez **"Nouvelle réunion"**
3. Entrez votre nom et le titre de la réunion
4. Le lien généré peut être envoyé via WhatsApp
5. Vos partenaires cliquent sur le lien et entrent le code
6. Pendant la réunion, cliquez **⏺️** pour enregistrer
7. À la fin, cliquez **📵** → le compte-rendu est généré automatiquement

---

## 📁 Structure du projet

```
reunionpro/
├── server/
│   ├── index.js          ← Backend Express (API Daily.co + Whisper)
│   ├── package.json
│   ├── .env.example      ← Template des variables d'environnement
│   └── .env              ← VOS clés (ne pas committer !)
│
└── client/
    ├── src/
    │   ├── App.jsx       ← Application React principale
    │   ├── index.css     ← Styles globaux
    │   └── main.jsx      ← Point d'entrée
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## 🔌 API Backend

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/rooms` | Crée une salle Daily.co |
| POST | `/api/rooms/token` | Génère un token participant |
| GET  | `/api/rooms/:name/recordings` | Liste les enregistrements |
| POST | `/api/transcribe` | Transcrit un audio (Whisper) |
| POST | `/api/summary` | Génère le compte-rendu (GPT-4o) |
| GET  | `/api/health` | Vérifie la configuration |

---

## 🌐 Déploiement en production

### Backend (Railway ou Render)
```bash
# Sur Railway.app ou Render.com
# Connectez votre dépôt GitHub
# Ajoutez les variables d'environnement dans le dashboard
# Le serveur démarre automatiquement avec : npm start
```

### Frontend (Vercel ou Netlify)
```bash
cd client
npm run build
# Déployez le dossier dist/ sur Vercel ou Netlify
# Configurez VITE_API_URL vers votre backend déployé
```

---

## 💡 Phase 3 — Fonctionnalités à ajouter

- [ ] Envoi automatique du compte-rendu par email
- [ ] Intégration WhatsApp Business API (envoi automatique du lien)
- [ ] Tableau de bord avec historique des réunions
- [ ] Base de données (PostgreSQL) pour sauvegarder les sessions
- [ ] Authentification utilisateurs
- [ ] Salles récurrentes (réunions hebdomadaires)
- [ ] Mode présentateur avec tableau blanc

---

## 💰 Coûts estimés

| Service | Gratuit | Payant |
|---------|---------|--------|
| Daily.co | 10 000 min/mois | ~$0.004/min ensuite |
| Whisper (OpenAI) | - | ~$0.006/min audio |
| GPT-4o | - | ~$0.01/compte-rendu |
| **Total 10 réunions/mois** | **~0€** | **< 2€/mois** |
