import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { chatsMessagesRetrieve } from "@/client/sdk.gen";
import { decodeJwtPayload } from "@/lib/jwt";

interface RouteParams {
    params: Promise<{ chat_id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    if (!accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        decodeJwtPayload(accessToken);
    } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chat_id } = await params;
    const chatId = Number(chat_id);
    if (!Number.isInteger(chatId) || chatId <= 0) {
        return NextResponse.json({ error: "Invalid chat_id" }, { status: 400 });
    }

    const beforeIdParam = request.nextUrl.searchParams.get("before_id");
    const beforeId = beforeIdParam ? Number(beforeIdParam) : undefined;

    const { data, error } = await chatsMessagesRetrieve({
        path: { chatId },
        query: beforeId !== undefined ? { before_id: beforeId } : undefined,
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (error || !data) {
        return NextResponse.json(error ?? { error: "Failed to fetch messages" }, { status: 500 });
    }

    return NextResponse.json(data);
}
