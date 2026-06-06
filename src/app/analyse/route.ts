import { NextRequest, NextResponse } from "next/server";
import { ChatGroq } from "@langchain/groq";
import { z } from "zod";

const signalSchema = z.object({
  type: z
    .enum(["buying_interest", "objection", "confusion", "other"])
    .describe("The category of the sales signal detected in the transcript."),
  quote: z
    .string()
    .describe("The exact, word-for-word quote from the transcript representing the signal. Do not summarize or paraphrase."),
  tip: z
    .string()
    .describe(
      "A highly professional, actionable coaching tip for the sales representative on how to handle or leverage this signal. Provide specific strategies, objection-handling phrases, or next steps instead of a simple summary."
    ),
});

const responseSchema = z.object({
  signals: z.array(signalSchema),
});

type Signal = z.infer<typeof signalSchema>;

function tryExtractSignalsFromText(text: string): Signal[] | null {
  if (!text || typeof text !== "string") return null;

  let cleanText = text;

  const funcMatch = cleanText.match(/<function=.*?>([\s\S]*?)<\/function>/);
  if (funcMatch) {
    cleanText = funcMatch[1];
  }

  if (cleanText.includes('\\"')) {
    cleanText = cleanText.replace(/\\"/g, '"');
  }

  const signals: Signal[] = [];

  const objectRegex = /\{[^{}]*\}/g;
  const matches = cleanText.match(objectRegex);

  if (matches) {
    for (const match of matches) {
      try {
        const parsed = JSON.parse(match);
        if (parsed && typeof parsed === "object") {
          const type = parsed.type || parsed.category;
          const quote = parsed.quote || parsed.text;
          const tip = parsed.tip || parsed.coaching_tip || parsed.suggestion;

          if (type && quote && tip) {
            signals.push({ type, quote, tip });
          }
        }
      } catch {
        try {
          const cleanedMatch = match.replace(/,\s*\}/g, "}");
          const parsed = JSON.parse(cleanedMatch);
          if (parsed && typeof parsed === "object") {
            const type = parsed.type || parsed.category;
            const quote = parsed.quote || parsed.text;
            const tip = parsed.tip || parsed.coaching_tip || parsed.suggestion;

            if (type && quote && tip) {
              signals.push({ type, quote, tip });
            }
          }
        } catch {
          try {
            const typeMatch = match.match(/"type"\s*:\s*"((?:[^"\\]|\\.)*)"/);
            const quoteMatch = match.match(/"quote"\s*:\s*"((?:[^"\\]|\\.)*)"/);
            const tipMatch = match.match(/"tip"\s*:\s*"((?:[^"\\]|\\.)*)"/);

            if (typeMatch && quoteMatch && tipMatch) {
              signals.push({
                type: typeMatch[1] as "buying_interest" | "objection" | "confusion" | "other",
                quote: quoteMatch[1],
                tip: tipMatch[1],
              });
            }
          } catch {}
        }
      }
    }
  }

  if (signals.length === 0) {
    try {
      const startIdx = cleanText.indexOf("{");
      const endIdx = cleanText.lastIndexOf("}");
      if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        const candidate = cleanText.substring(startIdx, endIdx + 1);
        const parsed = JSON.parse(candidate);
        if (parsed && Array.isArray(parsed.signals)) {
          return parsed.signals;
        }
      }
    } catch {
      try {
        let repaired = cleanText.trim();
        if (repaired.startsWith('["signals":')) {
          repaired = "{" + repaired.substring(1);
        }
        if (repaired.endsWith(";")) {
          repaired = repaired.slice(0, -1);
        }
        const openBraces = (repaired.match(/\{/g) || []).length;
        let closeBraces = (repaired.match(/\}/g) || []).length;
        while (openBraces > closeBraces) {
          repaired += "}";
          closeBraces++;
        }
        const openBrackets = (repaired.match(/\[/g) || []).length;
        let closeBrackets = (repaired.match(/\]/g) || []).length;
        while (openBrackets > closeBrackets) {
          repaired += "]";
          closeBrackets++;
        }

        const parsed = JSON.parse(repaired);
        if (parsed && Array.isArray(parsed.signals)) {
          return parsed.signals;
        }
      } catch {}
    }
  }

  return signals.length > 0 ? signals : null;
}

export async function POST(request: NextRequest) {
  try {
    const { transcript } = await request.json();

    if (!transcript || typeof transcript !== "string") {
      return NextResponse.json(
        { error: "Transcript is required and must be a string." },
        { status: 400 }
      );
    }

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return NextResponse.json(
        { error: "GROQ_API_KEY is not configured on the server." },
        { status: 500 }
      );
    }
    const model = new ChatGroq({
      apiKey: groqApiKey,
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
    });

    const structuredModel = model.withStructuredOutput(responseSchema, {
      name: "analyze_transcript",
    });

    const prompt = `You are an expert sales call analyst and sales coach.

Your task is to analyze a meeting transcript and identify meaningful sales signals.

Valid signal types:
- buying_interest
- objection
- confusion
- other

Rules:
- Only identify signals when they are related to a sales conversation.
- If the transcript is not a sales conversation, return an empty signals array.
- Do not invent signals that are not explicitly supported by the transcript.
- Extract quotes exactly as they appear in the transcript.
- For the 'tip' field, write a professional, highly actionable coaching suggestion. For example:
  * For 'objection': Provide a strategic response pattern (e.g., LAER method, shifting focus to ROI, or clarifying the underlying concern) instead of just summarizing the objection.
  * For 'buying_interest': Recommend next steps, trial offers, or prompt questions to secure commitment.
  * For 'confusion': Advise how to explain the concept simply or check for understanding.
- Return ONLY valid JSON matching the schema.

Transcript:
${transcript}`;

    let result;
    try {
      result = await structuredModel.invoke([
        [
          "system",
          "You are an expert sales coach. Analyze the transcript, extract signals, and provide professional, actionable tips. Return the exact JSON format specified.",
        ],
        ["user", prompt],
      ]);
    } catch (modelError: unknown) {
      console.warn("Structured output model invocation failed, attempting fallback parsing:", modelError);

      const err = modelError as { failed_generation?: string; message?: string } & Record<string, unknown>;
      const failedGen = err.failed_generation || "";
      const errMsg = err.message || "";
      const errString = typeof modelError === "object" && modelError !== null ? JSON.stringify(modelError) : String(modelError);

      const parsedSignals =
        tryExtractSignalsFromText(failedGen) ||
        tryExtractSignalsFromText(errMsg) ||
        tryExtractSignalsFromText(errString);

      if (parsedSignals && parsedSignals.length > 0) {
        result = { signals: parsedSignals };
      } else {
        result = { signals: [] };
      }
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Analysis error:", error);
    const errMsg = error instanceof Error ? error.message : "An error occurred during analysis.";
    return NextResponse.json(
      { error: errMsg },
      { status: 500 }
    );
  }
}
