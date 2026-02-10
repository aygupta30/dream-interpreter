import OpenAI from 'openai';
import { NextResponse } from 'next/server';

export async function POST(request) {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        return NextResponse.json({ error: 'OpenAI API Key is missing. Please add it to .env.local' }, { status: 500 });
    }

    const openai = new OpenAI({
        apiKey: apiKey,
    });

    try {
        const { dream } = await request.json();

        if (!dream) {
            return NextResponse.json({ error: 'Dream description is required' }, { status: 400 });
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            response_format: { type: "json_object" },
            messages: [
                {
                    role: "system", content: `You are a dream interpreter from r/DreamInterpretation. Interpret dreams using symbolic, psychological, and spiritual layers. Keep tone warm, insightful, and grounded.

You MUST respond with a valid JSON object matching this structure:
{
  "dream_summary": "Short summary of the dream",
  "tags": ["tag1", "tag2"],
  "mood": "Mood description",
  "symbolism": "Analysis of key symbols...",
  "psychological_perspective": "Psychological meaning...",
  "reflective_prompts": ["Question 1?", "Question 2?"],
  "tone": "Supportive and reflective"
}` },
                { role: "user", content: `Here is my dream: ${dream}` },
            ],
        });

        const content = completion.choices[0].message.content;
        const interpretation = JSON.parse(content);

        // Generate Image using DALL-E 3
        try {
            const imageResponse = await openai.images.generate({
                model: "dall-e-3",
                prompt: `A surreal, artistic, and abstract representation of this dream: ${interpretation.dream_summary} ${interpretation.tags.join(", ")}. Style: Mystical, deep colors, digital art, dreamscape. No text.`,
                n: 1,
                size: "1024x1024",
            });
            interpretation.imageUrl = imageResponse.data[0].url;
        } catch (imgError) {
            console.error("Image generation failed:", imgError);
            // We proceed without image if it fails, so we don't block the interpretation
        }

        return NextResponse.json({ interpretation });
    } catch (error) {
        if (error instanceof OpenAI.APIError) {
            console.error(error.status); // e.g. 401
            console.error(error.message); // e.g. The authentication token you passed was invalid...
            console.error(error.code); // e.g. 'invalid_api_key'
            console.error(error.type); // e.g. 'invalid_request_error'
        } else {
            // Non-API error
            console.error('Unexpected error:', error);
        }
        return NextResponse.json({ error: 'Failed to interpret dream', details: error.message }, { status: 500 });
    }
}
