# Sales Signal Analyzer

A Next.js web application that detects conversation signals from meeting transcripts — buying interest, objections, confusion, and more — and returns actionable coaching tips for sales representatives.

---

## LLM Details

- **Provider:** [Groq](https://groq.com/)
- **Model:** `llama-3.3-70b-versatile` via LangChain's `@langchain/groq`
- **Output structure:** LangChain's `.withStructuredOutput()` paired with a Zod schema to enforce clean, consistent JSON responses

---

## Setup

### Prerequisites

You'll need Node.js v18 or newer installed (v22 recommended), along with npm.

### Environment variables

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

Then add your Groq API key:

```env
GROQ_API_KEY=your_groq_api_key_here
```

### Install dependencies

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

### Production build (optional)

```bash
npm run build
npm start
```

---

## Tech Stack

- **Frontend:** Next.js App Router with React 19
- **Backend:** Next.js Route Handlers — a single `POST /analyse` endpoint
- **Orchestration:** LangChain (`@langchain/core` and `@langchain/groq`)
- **Validation:** Zod
- **Styling:** Custom vanilla CSS — CSS variables, glassmorphic layout, micro-animations, no Tailwind