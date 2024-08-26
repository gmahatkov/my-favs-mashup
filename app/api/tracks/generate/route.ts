import { NextResponse, type NextRequest } from "next/server";
import {useGenerateTrack, useGetGeneratedTrackInfo} from "@/utils/api";

export const POST = async (req: NextRequest): Promise<NextResponse> => {
    try {
        const data = await useGenerateTrack(req);
        return NextResponse.json({ data });
    } catch (error) {
        console.error(error);
        return NextResponse.json({
            error: "Internal Server Error",
        }, {
            status: 500
        });
    }
};

export const GET = async (req: NextRequest): Promise<NextResponse> => {
    try {
        const data = await useGetGeneratedTrackInfo(req);
        return NextResponse.json({ data });
    } catch (error) {
        console.error(error);
        return NextResponse.json({
            error: "Internal Server Error",
        }, {
            status: 500
        });
    }
}