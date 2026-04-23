# Second Brain OS

A personal AI knowledge operating system. Every question you ask gets answered AND compressed into a permanent knowledge node — building your personal brain graph over time.

## Quick Start (Local)

**Requirements:** Node.js 18+

```bash
# 1. Install dependencies
npm install

# 2. Run locally
npm run dev

# 3. Open http://localhost:5173
# Enter your Anthropic API key when prompted
```

Get a free Anthropic API key at: https://console.anthropic.com

---

## Deploy to Vercel (Free, 5 minutes)

1. Push this folder to a GitHub repo
2. Go to https://vercel.com → "Add New Project"
3. Import your GitHub repo
4. Click Deploy — done. No env vars needed (key is entered in the UI)

---

## Deploy to Netlify (Free, 5 minutes)

1. Push to GitHub
2. Go to https://netlify.com → "Add new site" → "Import from Git"
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Deploy

---

## How It Works

- You enter your Anthropic API key once — stored in your browser only
- Ask any question → Claude answers it AND extracts: concept, category, insight, connections, XP score
- Your knowledge graph builds over time in localStorage
- Three views: Ask, Knowledge Graph, Insights (daily review)

## Stack

- React 18 + Vite
- Anthropic API (claude-haiku-4-5-20251001)
- Zero backend — runs entirely in the browser
- localStorage for persistence

## Next Steps to Build This Into a Product

- [ ] Add Supabase for cross-device sync
- [ ] Add spaced repetition quiz mode
- [ ] Add user auth
- [ ] Add streak tracking
- [ ] Ship to Product Hunt
