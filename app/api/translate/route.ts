import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3000",
    "X-Title": "Healthcare Translation App",
  },
});

export async function POST(request: Request) {
    console.log("Translation API called")
  try {
    const { text, targetLanguage } = await request.json();

    if (!text || !targetLanguage) {
      return NextResponse.json(
        { error: "Missing required fields: text or targetLanguage" },
        { status: 400 }
      );
    }

    // System prompt designed to correct speech errors and translate
    const systemPrompt = `You are an expert medical translator assistant.
    The input text is a transcript from a voice interface and may contain speech recognition errors, especially with medical terminology.
    
    Your tasks:
    1. Analyze the text and correct any obvious phonetic errors related to medical terms.
    2. Translate the corrected text into ${targetLanguage}.
    3. Maintain a professional, empathetic tone suitable for healthcare settings.

    Return the output strictly as a JSON object with the following keys:
    - "correctedText": The text after fixing medical terms (in the source language).
    - "translatedText": The final translation in ${targetLanguage}.

    No need to add any expalation we only need the json object, it is important we only
    need JSON object no need to add any expalation.
    `;

    const completion = await openai.chat.completions.create({
      model: "deepseek/deepseek-r1-0528:free",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text },
      ],
      response_format: { type: "json_object" },
    });

    let responseContent = completion.choices[0].message.content;

    // Clean up DeepSeek R1's <think> tags and markdown code blocks if present
    if (responseContent) {
      responseContent = responseContent.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
      responseContent = responseContent.replace(/```json/g, "").replace(/```/g, "").trim();
    }

    console.log("Response Content:", responseContent);

    const parsedResponse = responseContent ? JSON.parse(responseContent) : {};

    return NextResponse.json(parsedResponse);


  } catch (error) {
    console.error("Error in translation API:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
