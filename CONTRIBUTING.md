# Contributing to ThreadMiner ⛏️

First off, thanks for taking the time to contribute! 🎉

ThreadMiner is an open-source project and we love to receive contributions from our community. There are many ways to contribute, from writing tutorials or blog posts, improving the documentation, submitting bug reports and feature requests, or writing code.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Style Guide](#style-guide)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our commitment to creating a welcoming and inclusive environment. Please be respectful and constructive in all interactions.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Fork & Clone

```bash
# Fork the repo on GitHub, then:
git clone https://github.com/YOUR_USERNAME/REDDITMINER.git
cd REDDITMINER/threadminer
npm install
npm run dev
```

## 💡 How to Contribute

### 🐛 Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- **Clear title** describing the issue
- **Steps to reproduce** the behavior
- **Expected behavior** vs what actually happened
- **Screenshots** if applicable
- **Environment** (OS, browser, Node version)

### ✨ Suggesting Features

Feature requests are welcome! Please include:

- **Clear description** of the feature
- **Use case** - why would this be useful?
- **Possible implementation** (optional)

### 🔧 Code Contributions

#### Good First Issues

Look for issues labeled `good first issue` - these are great for newcomers!

#### Ideas for Contributions

- **INTEL Patterns**: Add detection patterns for specific subreddits
- **AI Integration**: Implement Groq/OpenAI for real LLM analysis
- **Export Options**: Add Notion, Airtable, Google Sheets export
- **Chrome Extension**: Build a browser extension
- **UI Improvements**: New themes, accessibility improvements
- **Performance**: Caching improvements, pagination
- **Tests**: Add unit and integration tests

## 🛠️ Development Setup

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run linter
npm run lint

# Build for production
npm run build
```

### Project Structure

```
threadminer/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   └── fetch-thread/  # Main API endpoint
│   ├── page.tsx           # Main page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── url-input.tsx      # URL input with validation
│   ├── format-selector.tsx
│   ├── depth-selector.tsx
│   ├── insights-panel.tsx # INTEL mode UI
│   └── ...
├── lib/                   # Core logic
│   ├── reddit.ts          # Reddit API fetching & normalization
│   ├── ai-analysis.ts     # INTEL signal extraction
│   ├── schemas.ts         # TypeScript types
│   ├── store.ts           # Zustand state
│   └── utils.ts           # Utilities
└── public/                # Static assets
```

## 📝 Pull Request Process

1. **Create a branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** and commit with clear messages:
   ```bash
   git commit -m "feat: add export to Notion"
   git commit -m "fix: handle rate limit errors"
   git commit -m "docs: update API documentation"
   ```

3. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

4. **Open a Pull Request** with:
   - Clear title and description
   - Link to related issue (if any)
   - Screenshots for UI changes

5. **Address review feedback** if requested

## 🎨 Style Guide

### TypeScript

- Use TypeScript for all new code
- Define interfaces for props and data structures
- Avoid `any` - use proper types

### React

- Use functional components with hooks
- Keep components small and focused
- Use Zustand for global state

### CSS

- Use Tailwind CSS utilities
- Use CSS variables for theming (defined in `globals.css`)
- Keep component styles co-located

### Commits

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting (no code change)
- `refactor:` Code restructuring
- `test:` Adding tests
- `chore:` Maintenance

## 🙏 Recognition

Contributors will be:

- Listed in the README
- Mentioned in release notes
- Forever appreciated! ❤️

---

Questions? Reach out to [@0x_Vivek](https://x.com/0x_Vivek) on X!

Happy mining! ⛏️

