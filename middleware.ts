import { auth } from "@/auth";
import {MiddlewareConfig, NextRequest, NextResponse} from "next/server";
import { redirect } from "next/navigation";
import type { NextMiddleware } from "next/server";

export const middleware: NextMiddleware = async (req, res) =>
{
    const session = await auth();
    if (!session) {
        return NextResponse.redirect(new URL("/login", req.url));
    }
}

export const config: MiddlewareConfig = {
    matcher: ['/dashboard', '/dashboard/:path*'],
}