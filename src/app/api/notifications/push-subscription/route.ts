import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

async function getAccessToken(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get("access_token")?.value ?? null;
}

export async function POST(request: NextRequest) {
    const accessToken = await getAccessToken();
    if (!accessToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const res = await fetch(`${BACKEND_URL}/api/notifications/push-subscription/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        return NextResponse.json({ error: "Failed to save subscription" }, { status: res.status });
    }
    return new NextResponse(null, { status: 204 });
}

export async function DELETE(_request: NextRequest) {
    const accessToken = await getAccessToken();
    if (!accessToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const res = await fetch(`${BACKEND_URL}/api/notifications/push-subscription/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
        return NextResponse.json({ error: "Failed to remove subscription" }, { status: res.status });
    }
    return new NextResponse(null, { status: 204 });
}
