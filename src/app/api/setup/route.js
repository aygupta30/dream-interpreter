import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const result = await sql`
      CREATE TABLE IF NOT EXISTS dreams (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        dream_text TEXT NOT NULL,
        interpretation JSONB NOT NULL,
        image_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
        return NextResponse.json({ result }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error }, { status: 500 });
    }
}
