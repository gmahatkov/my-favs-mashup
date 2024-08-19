import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";
import {useGetTrackList} from "@/utils/spotify-api";

export const GET = auth(
    async (req: NextRequest): Promise<NextResponse> =>
    {
        try {
            const data = await useGetTrackList(req);
            return NextResponse.json(data);
        } catch (error) {
            console.error(error);
            return NextResponse.json({
                error: "Internal Server Error",
            }, {
                status: 500
            });
        }
    }
);