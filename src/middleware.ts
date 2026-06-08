import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from "jose";

export default async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // ---------------------------------------------------------
    // 1. Admin Authentication Logic (Merged from proxy.ts)
    // ---------------------------------------------------------
    const isProtectedAdminPath = path.startsWith("/admin") && !path.startsWith("/admin/login");

    if (isProtectedAdminPath) {
        const token = request.cookies.get("admin_token")?.value;

        if (!token) {
            return NextResponse.redirect(new URL("/admin/login", request.url));
        }

        try {
            const secret = new TextEncoder().encode(
                process.env.JWT_SECRET || "your-secret-key"
            );

            await jwtVerify(token, secret);
            // Token is valid, proceed.
        } catch (error) {
            // Token is invalid or expired
            return NextResponse.redirect(new URL("/admin/login", request.url));
        }
    }

    // ---------------------------------------------------------
    // 2. Agent Authentication Logic
    // ---------------------------------------------------------
    const isProtectedAgentPath = path.startsWith("/agent") && !path.startsWith("/agent/login");

    if (isProtectedAgentPath) {
        const token = request.cookies.get("token")?.value;

        if (!token) {
            return NextResponse.redirect(new URL("/agent/login", request.url));
        }

        try {
            const secret = new TextEncoder().encode(
                process.env.JWT_SECRET || "your-secret-key"
            );
            const { payload } = await jwtVerify(token, secret);
            const decoded = payload as any;

            if (decoded.role !== "agent") {
                return NextResponse.redirect(new URL("/agent/login", request.url));
            }
        } catch (error) {
            // Token is invalid or expired
            return NextResponse.redirect(new URL("/agent/login", request.url));
        }
    }

    // ---------------------------------------------------------
    // 2. Site Gating Logic (Mahashivratri Countdown)
    // ---------------------------------------------------------

    // Target time: Feb 14, 2026, 23:31:36 IST (3 minutes from now)
    // ISO string for IST (UTC+5:30) is 2026-02-14T23:31:36+05:30
    const targetDate = new Date('2026-02-15T06:00:00+05:30');
    const now = new Date();

    // If we are PAST the target date, ensure we don't get stuck on /countdown
    if (now >= targetDate) {
        if (path === '/countdown') {
            return NextResponse.redirect(new URL('/', request.url));
        }
        return NextResponse.next();
    }

    // Paths to exclude from redirection (Admin, Agent, API, assets)
    // Note: /admin is excluded here, so it verifies auth above but doesn't get blocked by countdown.
    // /admin paths already handled above will pass through here because they match excludedPaths.
    const excludedPaths = [
        '/countdown',
        '/admin',
        '/agent',
        '/api',
        '/_next',
        '/favicon.ico',
        '/assets',
        '/images',
        '/login' // Just in case there are other login paths
    ];

    // Check if the current path starts with any of the excluded paths
    const isExcluded = excludedPaths.some((excluded) => path.startsWith(excluded));

    if (isExcluded) {
        return NextResponse.next();
    }

    // If we are here, it's a public route and it's BEFORE the target time.
    // Redirect to countdown.
    console.log(`[Middleware] Redirecting ${path} to /countdown`);
    return NextResponse.redirect(new URL('/countdown', request.url));
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
