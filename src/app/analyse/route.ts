import { NextRequest, NextResponse } from "next/server";
import { ChatGroq } from "@langchain/groq";
import { z } from "zod";

const signalSchema = z.object({
  type: z.enum(["buying_interest", "objection", "confusion", "other"]),
  quote: z.string(),
  tip: z.string(),
});

const responseSchema = z.object({
  signals: z.array(signalSchema),
});

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
      temperature: 2,
    });

    // Use withStructuredOutput to get back parsed JSON matching our Zod schema
    const structuredModel = model.withStructuredOutput(responseSchema, {
      name: "analyze_transcript",
    });

    const prompt = `You are an expert sales call analyst.

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
- Return ONLY valid JSON.
- Do not include explanations, markdown, or additional text

Transcript:
${transcript}`;

    const result = await structuredModel.invoke([
      ["system", "You are an expert sales coach. Analyze the transcript and extract signals. Return the exact JSON format specified."],
      ["user", prompt],
    ]);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred during analysis." },
      { status: 500 }
    );
  }
}
