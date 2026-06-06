# Sales Signal Analyzer

A simple, premium Next.js web application that detects conversation signals (buying interest, objections, confusion, and other) from meeting transcripts, returning immediate, actionable coaching tips for sales representatives.

---

## 🤖 LLM Details
- **LLM Provider**: [Groq](https://groq.com/)
- **Model Used**: `llama-3.3-70b-versatile` (configured via LangChain `@langchain/groq`)
- **Structure Enforcement**: LangChain's `.withStructuredOutput()` combined with a `zod` schema to guarantee clean JSON outputs.

---

## 🚀 Setup Steps

### 1. Prerequisites
Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v18.x or newer, v22.x recommended)
- `npm` (usually comes with Node.js)

### 2. Set Up Environment Variables
Create a `.env.local` file in the root directory if it does not already exist:
```bash
cp .env.example .env.local  # Or create it manually
```

Add your Groq API Key:
```env
GROQ_API_KEY=your_groq_api_key_here
```
*You can get a free API key by visiting the [Groq Console](https://console.groq.com/).*

### 3. Install Dependencies
Run the following command in the root folder to install all required packages:
```bash
npm install
```

### 4. Run the Development Server
Launch the local development server:
```bash
npm run dev
```

Open your browser and navigate to **[http://localhost:3000](http://localhost:3000)**.

### 5. Build for Production (Optional)
To verify or compile a production bundle:
```bash
npm run build
npm start
```

---

## 🛠️ Technology Stack
- **Frontend**: Next.js App Router (React 19)
- **Backend API**: Next.js Route Handlers (`POST /analyse`)
- **Orchestration**: LangChain (`@langchain/core` & `@langchain/groq`)
- **Validation**: Zod
- **Styling**: Premium Vanilla CSS (custom variables, glassmorphic layout, micro-animations, no Tailwind)
