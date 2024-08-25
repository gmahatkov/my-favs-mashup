import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";
import { useGetMashupPrompt, useGetTrackList} from "@/utils/api";

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

export const POST = auth(
    async (req: NextRequest): Promise<NextResponse> =>
    {
        try {
            const prompt = await useGetMashupPrompt(req);
            return NextResponse.json({ prompt });
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