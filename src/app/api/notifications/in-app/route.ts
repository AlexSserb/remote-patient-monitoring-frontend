import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

async function getAccessToken(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get("access_token")?.value ?? null;
}

export async function GET(request: NextRequest) {
    const accessToken = await getAccessToken();
    if (!accessToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const qs = searchParams.toString();
    const url = `${BACKEND_URL}/api/notifications/in-app/${qs ? `?${qs}` : ""}`;

    const res = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) return NextResponse.json({ error: "Failed to fetch notifications" }, { status: res.status });
    return NextResponse.json(await res.json());
}
