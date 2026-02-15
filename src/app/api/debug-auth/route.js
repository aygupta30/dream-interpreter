import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    const { userId, sessionId, getToken } = auth();

    const secretKey = process.env.CLERK_SECRET_KEY;
    const pubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

    // Check for session cookie
    const cookieHeader = request.headers.get('cookie') || '';
    const hasSessionCookie = cookieHeader.includes('__session');

    return NextResponse.json({
        auth_status: {
            userId: userId,
            sessionId: sessionId,
            isLoaded: true
        },
        cookie_check: {
            has_session_cookie: hasSessionCookie,
            cookie_length: cookieHeader.length
        },
        env_check: {
            CLERK_SECRET_KEY_EXISTS: !!secretKey,
            CLERK_SECRET_KEY_PREFIX: secretKey ? secretKey.substring(0, 7) : 'MISSING',
            CLERK_SECRET_KEY_SUFFIX: secretKey ? '...' + secretKey.slice(-4) : 'MISSING',
            NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_EXISTS: !!pubKey,
            NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_PREFIX: pubKey ? pubKey.substring(0, 7) : 'MISSING',
            NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_SUFFIX: pubKey ? '...' + pubKey.slice(-4) : 'MISSING'
        }
    });
}
