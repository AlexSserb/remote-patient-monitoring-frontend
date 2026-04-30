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

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const accessToken = await getAccessToken();
    if (!accessToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { searchParams } = request.nextUrl;
    const patientId = searchParams.get("patient_id");

    const url = new URL(`${BACKEND_URL}/api/diagnoses/diary-entries/${id}/`);
    if (patientId) url.searchParams.set("patient_id", patientId);

    const body: unknown = await request.json();
    const res = await fetch(url.toString(), {
        method: "PATCH",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    const responseBody: unknown = await res.json();
    return NextResponse.json(responseBody, { status: res.status });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const accessToken = await getAccessToken();
    if (!accessToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { searchParams } = request.nextUrl;
    const patientId = searchParams.get("patient_id");

    const url = new URL(`${BACKEND_URL}/api/diagnoses/diary-entries/${id}/`);
    if (patientId) url.searchParams.set("patient_id", patientId);

    const res = await fetch(url.toString(), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (res.status === 204) return new NextResponse(null, { status: 204 });
    const responseBody: unknown = await res.json();
    return NextResponse.json(responseBody, { status: res.status });
}
