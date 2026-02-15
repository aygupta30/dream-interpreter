import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET(request) {
    const { userId } = auth();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { rows } = await sql`
      SELECT * FROM dreams WHERE user_id = ${userId} ORDER BY created_at DESC;
    `;
        return NextResponse.json({ dreams: rows });
    } catch (error) {
        return NextResponse.json({ error }, { status: 500 });
    }
}

export async function POST(request) {
    const { userId } = auth();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { dream_text, interpretation, image_url } = await request.json();

        // Safety check
        if (!dream_text || !interpretation) {
            return NextResponse.json({ error: 'Missing Data' }, { status: 400 });
        }

        await sql`
      INSERT INTO dreams (user_id, dream_text, interpretation, image_url)
      VALUES (${userId}, ${dream_text}, ${interpretation}, ${image_url});
    `;

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error }, { status: 500 });
    }
}
