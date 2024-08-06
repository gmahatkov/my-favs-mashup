import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";
import {getSpotifyToken} from "@/utils/jwt";

export const POST = auth(
    async (req: NextRequest): Promise<NextResponse> =>
    {
        const { message } = await req.json();
        const { accessToken, refreshToken } = await getSpotifyToken(req);
        const sRes = await fetch("https://api.spotify.com/v1/me/tracks", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        const list = await sRes.json();
        const first = list?.items[0];
        let data = {};
        if (first) {
            const sDataRes = await fetch(`https://api.spotify.com/v1/audio-features/${first.track.id}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            data = await sDataRes.json();
        }
        return NextResponse.json({ message: `Hello, ${message ?? 'world'}!`, first, data });
    }
);
