import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

async function getAccessToken(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get("access_token")?.value ?? null;
}

function buildUrl(userId: string | null): string {
    const base = `${BACKEND_URL}/api/notifications/vk-subscription/`;
    return userId ? `${base}?user_id=${userId}` : base;
}

export async function GET(request: NextRequest) {
    const accessToken = await getAccessToken();
    if (!accessToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = request.nextUrl.searchParams.get("userId");
    const res = await fetch(buildUrl(userId), {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
    });

    if (!res.ok) return NextResponse.json({ error: "Failed" }, { status: res.status });
    return NextResponse.json(await res.json());
}

export async function DELETE(request: NextRequest) {
    const accessToken = await getAccessToken();
    if (!accessToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = request.nextUrl.searchParams.get("userId");
    const res = await fetch(buildUrl(userId), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) return NextResponse.json({ error: "Failed" }, { status: res.status });
    return new NextResponse(null, { status: 204 });
}