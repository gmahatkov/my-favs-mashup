import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest): Promise<NextResponse> {
    const { message } = await request.json();
    return NextResponse.json<{ message: string }>({ message: `Hello, ${message ?? 'world'}!` });
}