<p align="center">
  <img src="public/favicon.svg" alt="ThreadMiner Logo" width="80" height="80">
</p>

<h1 align="center">ThreadMiner ⛏️</h1>

<p align="center">
  <strong>Mine Reddit threads for gold.</strong><br>
  Extract clean JSON, markdown, or AI-powered insights from any Reddit URL.
</p>

<p align="center">
  <a href="https://github.com/Sigmabrogz/REDDITMINER/stargazers"><img src="https://img.shields.io/github/stars/Sigmabrogz/REDDITMINER?style=social" alt="Stars"></a>
  <a href="https://github.com/Sigmabrogz/REDDITMINER/fork"><img src="https://img.shields.io/github/forks/Sigmabrogz/REDDITMINER?style=social" alt="Forks"></a>
  <a href="https://x.com/0x_Vivek"><img src="https://img.shields.io/twitter/follow/0x_Vivek?style=social" alt="Twitter"></a>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#demo">Demo</a> •
  <a href="#installation">Installation</a> •
  <a href="#usage">Usage</a> •
  <a href="#api">API</a> •
  <a href="#contributing">Contributing</a>
</p>

---

## 🎯 The Problem

There's a **stupid amount of money** in Reddit data:

- Add `/.json` to the end of any Reddit URL
- Instantly get the entire thread with every reply
- Feed it to an LLM → Extract pain points, buying intent, solutions
- Niche subreddits are **unmined gold**

People literally tell you what they want. You just need to listen at scale.

**ThreadMiner makes this easy.**

---

## ✨ Features

### 📤 4 Output Formats

| Format | Description |
|--------|-------------|
| **RAW** | Original Reddit JSON - exactly what the API returns |
| **CLEAN** | Normalized schema - consistent, typed, easy to parse |
| **MARKDOWN** | Human-readable format - perfect for reports |
| **INTEL** | AI-powered insights - pain points, buying intent, shill detection |

### 🔍 Smart INTEL Analysis

- **🔥 Pain Points** - Detect frustration, complaints, feature requests
- **💰 Buying Intent** - Find people ready to purchase
- **✅ Solutions** - Community recommendations (shills filtered out!)
- **⚠️ Shill Detection** - Flag affiliate links, self-promo, tracking URLs
- **📊 Sentiment Analysis** - Positive/negative/neutral breakdown

### ⚡ Performance

- **Direct browser fetching** - Reddit allows CORS, no proxy needed
- **Smart caching** - 5-minute cache, instant repeat loads
- **Depth control** - Quick scan (~50), Standard (~200), Deep dive (500+)
- **Rate limit handling** - Automatic retry with backoff

### 🎨 Modern UI

- Retro-minimalist dark theme
- Micro-animations & confetti celebrations
- Mobile-responsive
- No signup required

---

## 🚀 Demo

Try it live: **[Coming Soon]**

Or run locally in 30 seconds:

```bash
git clone https://github.com/Sigmabrogz/REDDITMINER.git
cd REDDITMINER/threadminer
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 📦 Installation

### Prerequisites

- Node.js 18+
- npm or yarn

### Quick Start

```bash
# Clone the repo
git clone https://github.com/Sigmabrogz/REDDITMINER.git

# Navigate to project
cd REDDITMINER/threadminer

# Install dependencies
npm install

# Start development server
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

---

## 🔧 Usage

### Web Interface

1. Paste any Reddit thread URL
2. Select output format (RAW, CLEAN, MD, INTEL)
3. Choose comment depth
4. Click **Mine Thread**
5. Export as JSON, Markdown, or CSV

### Programmatic Usage

ThreadMiner runs entirely client-side. You can use the core functions directly:

```typescript
import { fetchThreadClientSide, normalizeThread } from '@/lib/reddit';

// Fetch raw Reddit data
const raw = await fetchThreadClientSide(url, {
  sort: 'best',
  limit: 500,
});

// Normalize the data
const normalized = normalizeThread(raw, {
  depth: 'level2',
  maxComments: 500,
  minScore: 0,
});
```

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **State:** Zustand
- **Language:** TypeScript

---

## 🤝 Contributing

We love contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Quick Contribution Guide

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Ideas for Contributions

- [ ] Add more INTEL patterns for specific subreddits
- [ ] Implement real AI analysis (Groq/OpenAI integration)
- [ ] Add thread comparison feature
- [ ] Build Chrome extension
- [ ] Add export to Notion/Airtable
- [ ] Implement user accounts & saved threads

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 🙏 Support

If ThreadMiner helped you, consider:

- ⭐ **Starring this repo**
- 🐦 **Following [@0x_Vivek](https://x.com/0x_Vivek)** on X
- 🍴 **Forking & contributing**

---

<p align="center">
  Built with ❤️ by <a href="https://x.com/0x_Vivek">@0x_Vivek</a>
</p>

<p align="center">
  <a href="https://x.com/0x_Vivek">
    <img src="https://img.shields.io/badge/Follow-@0x__Vivek-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white" alt="Follow on Twitter">
  </a>
</p>
