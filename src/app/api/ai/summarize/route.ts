import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import { SummarizeRequest, SummarizeResponse } from "@/types";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: Request) {
  try {
    const { transcript, userNotes, language, meetingContext }: SummarizeRequest = await request.json();

    if (!transcript) {
      return NextResponse.json({ message: "Transcript is required for summarization" }, { status: 400 });
    }

    // Construct the prompt for GPT-4 Turbo
    const prompt = `
      You are an AI assistant specialized in generating concise and structured meeting summaries.
      Analyze the following meeting transcript and user notes to extract:
      1. A comprehensive summary of the meeting.
      2. Key discussion points.
      3. Actionable To-Do items (assignee, task, optional deadline, priority: high/medium/low).
      4. Decisions made during the meeting.
      5. Any open issues or topics that need further discussion.

      Prioritize clarity, conciseness, and accuracy. The output should be in JSON format.
      The language for the summary and extracted items should be "${language}".

      Meeting Context: ${meetingContext || "General Meeting"}
      User Notes: ${userNotes || "No specific user notes provided."}

      Transcript:
      """
      ${transcript}
      """

      Please provide the output in the following JSON format:
      {
        "summary": "string",
        "keyPoints": ["string", "string", ...],
        "todos": [
          { "assignee": "string", "task": "string", "deadline": "YYYY-MM-DD (optional)", "priority": "high" | "medium" | "low" },
          ...
        ],
        "decisions": ["string", "string", ...],
        "openIssues": ["string", "string", ...]
      }
    `;

    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4-turbo", // As per CLAUDE.md
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }, // Ensure JSON output
      temperature: 0.2, // Lower temperature for more factual and less creative output
    });

    const content = chatCompletion.choices[0]?.message?.content;

    if (!content) {
      throw new Error("GPT-4 Turbo did not return any content.");
    }

    let aiOutput: SummarizeResponse;
    try {
      aiOutput = JSON.parse(content);
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", content);
      throw new Error("AI response was not valid JSON.");
    }

    // Basic validation to ensure the structure matches SummarizeResponse
    if (!aiOutput.summary || !Array.isArray(aiOutput.keyPoints) || !Array.isArray(aiOutput.todos) || !Array.isArray(aiOutput.decisions) || !Array.isArray(aiOutput.openIssues)) {
      console.warn("AI output structure mismatch:", aiOutput);
      // Attempt to return what we have, or throw a more specific error
      throw new Error("AI output structure does not match expected format.");
    }

    return NextResponse.json(aiOutput, { status: 200 });
  } catch (error) {
    console.error("Error in AI summarization API:", error);
    return NextResponse.json({ message: "Failed to generate AI summary", error: (error as Error).message }, { status: 500 });
  }
}
