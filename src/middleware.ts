import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware((auth, req) => {
    // Debug: Log if userId is present
    const { userId } = auth();
    console.log("Middleware Check - UserId:", userId);

    // Add header to confirm it ran AND what user it saw
    const res = NextResponse.next();
    res.headers.set('x-clerk-debug-user', userId || 'null');
    return res;
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};
