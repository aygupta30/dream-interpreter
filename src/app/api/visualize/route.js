import OpenAI from 'openai';
import { NextResponse } from 'next/server';

export async function POST(request) {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        return NextResponse.json({ error: 'OpenAI API Key is missing.' }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey });

    try {
        const { description } = await request.json();

        if (!description) {
            return NextResponse.json({ error: 'Description is required' }, { status: 400 });
        }

        const imageResponse = await openai.images.generate({
            model: "dall-e-3",
            prompt: `A surreal, artistic, and abstract representation of this dream: ${description}. Style: Mystical, deep colors, digital art, dreamscape. No text.`,
            n: 1,
            size: "1792x1024",
        });

        return NextResponse.json({ imageUrl: imageResponse.data[0].url });

    } catch (error) {
        console.error('Error generating image:', error);
        return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
    }
}
