import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

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
    console.log("API POST /api/journal - Auth Check. UserId:", userId);

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized', debug_userId: userId }, { status: 401 });
    }

    try {
        const { dream_text, interpretation, image_url } = await request.json();

        console.log("Saving Dream for User:", userId);
        console.log("Dream Text Length:", dream_text?.length);

        // Safety check
        if (!dream_text || !interpretation) {
            console.error("Missing Data");
            return NextResponse.json({ error: 'Missing Data' }, { status: 400 });
        }

        // Explicitly stringify interpretation for JSONB compatibility if needed, 
        // though strictly pg often handles objects. Let's force it to ensure compatibility.
        // Actually, let's keep it as object first but log if it fails.
        // Better: let's try to stringify it to be safe for the SQL template if the driver expects a string for JSONB.
        const interpretationJson = JSON.stringify(interpretation);

        await sql`
          INSERT INTO dreams (user_id, dream_text, interpretation, image_url)
          VALUES (${userId}, ${dream_text}, ${interpretationJson}::jsonb, ${image_url});
        `;

        console.log("Dream Saved Successfully");
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Database Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
