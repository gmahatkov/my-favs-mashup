import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";
import {getSpotifyToken} from "@/utils/jwt";

export const POST = auth(
    async (req: NextRequest): Promise<NextResponse> =>
    {
        const { message } = await req.json();
        return NextResponse.json({ message: `Hello, ${message ?? 'world'}!` });
    }
);
