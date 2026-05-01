import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { decodeJwtPayload } from "@/lib/jwt";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

async function getAccessToken(): Promise<string | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
    if (!token) return null;
    try {
        decodeJwtPayload(token);
        return token;
    } catch {
        return null;
    }
}

export async function GET(request: NextRequest) {
    const accessToken = await getAccessToken();
    if (!accessToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = request.nextUrl;
    const patientId = searchParams.get("patient_id");

    const url = new URL(`${BACKEND_URL}/api/diagnoses/diary-entries/`);
    if (patientId) url.searchParams.set("patient_id", patientId);

    const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    const body: unknown = await res.json();
    return NextResponse.json(body, { status: res.status });
}

export async function POST(request: NextRequest) {
    const accessToken = await getAccessToken();
    if (!accessToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = request.nextUrl;
    const patientId = searchParams.get("patient_id");

    const url = new URL(`${BACKEND_URL}/api/diagnoses/diary-entries/`);
    if (patientId) url.searchParams.set("patient_id", patientId);

    const body: unknown = await request.json();
    const res = await fetch(url.toString(), {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    const responseBody: unknown = await res.json();
    return NextResponse.json(responseBody, { status: res.status });
}
