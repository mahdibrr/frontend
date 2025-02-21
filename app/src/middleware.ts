import { NextResponse } from 'next/server';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function middleware() {
  // Custom middleware logic
  return NextResponse.next();
}

// Replace with new route segment config format
export const routeSegmentConfig = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
    // Allow public access to SSO callback
    '/sso-callback',
    // Include the root path
    '/',
  ],
};
