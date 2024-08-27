import {NextRequest} from "next/server";
import {getToken} from "@auth/core/jwt";

class SpotifyAccessError extends Error {
    constructor() {
        super("Spotify access token not found");
    }
}

export async function getSpotifyToken( req: NextRequest): Promise<{ accessToken: string; refreshToken: string }> {
    // @ts-ignore
    const { spotify } = ((await getToken({
        req,
        secureCookie: process.env.NODE_ENV === "production",
        secret: process.env.AUTH_SECRET as string,
    })) ?? {}) as { accessToken: string; refreshToken: string };
    if (!spotify) throw new SpotifyAccessError();
    return spotify;
}