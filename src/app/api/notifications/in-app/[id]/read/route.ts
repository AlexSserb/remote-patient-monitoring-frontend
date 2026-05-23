import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

async function getAccessToken(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get("access_token")?.value ?? null;
}

export async function PATCH(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const accessToken = await getAccessToken();
    if (!accessToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const res = await fetch(`${BACKEND_URL}/api/notifications/in-app/${id}/read/`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) return NextResponse.json({ error: "Failed to mark notification as read" }, { status: res.status });
    return new NextResponse(null, { status: 204 });
}
