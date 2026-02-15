import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    const { userId, sessionId, getToken } = auth();

    const secretKey = process.env.CLERK_SECRET_KEY;
    const pubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

    return NextResponse.json({
        auth_status: {
            userId: userId,
            sessionId: sessionId,
            isLoaded: true
        },
        env_check: {
            CLERK_SECRET_KEY_EXISTS: !!secretKey,
            CLERK_SECRET_KEY_PREFIX: secretKey ? secretKey.substring(0, 7) : 'MISSING',
            NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_EXISTS: !!pubKey,
            NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_PREFIX: pubKey ? pubKey.substring(0, 7) : 'MISSING'
        }
    });
}
