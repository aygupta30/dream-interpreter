import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const tableQuery = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;

        const columnQuery = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'dreams'
    `;

        return NextResponse.json({
            tables: tableQuery.rows,
            columns: columnQuery.rows,
            hasPostgresUrl: !!process.env.POSTGRES_URL // Masked, but confirm existence
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
