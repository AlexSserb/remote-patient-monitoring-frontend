import { type NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export async function GET(_request: NextRequest) {
    const res = await fetch(`${BACKEND_URL}/api/notifications/vapid-public-key/`);
    if (!res.ok) {
        return NextResponse.json({ error: "Failed to fetch VAPID key" }, { status: 500 });
    }
    return NextResponse.json(await res.json());
}
