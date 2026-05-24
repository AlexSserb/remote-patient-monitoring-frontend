import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

async function getAccessToken(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get("access_token")?.value ?? null;
}

export async function POST() {
    const accessToken = await getAccessToken();
    if (!accessToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const res = await fetch(`${BACKEND_URL}/api/notifications/in-app/read-all/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) return NextResponse.json({ error: "Failed to mark all notifications as read" }, { status: res.status });
    return new NextResponse(null, { status: 204 });
}
