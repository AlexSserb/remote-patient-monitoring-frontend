import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { decodeJwtPayload } from "@/lib/jwt";
import { notificationsSchedulesCreate, notificationsSchedulesList } from "@/client/sdk.gen";

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

    const patientId = request.nextUrl.searchParams.get("patientId");
    if (!patientId) return NextResponse.json({ error: "patientId is required" }, { status: 400 });

    const { data, error } = await notificationsSchedulesList({
        query: { patient_id: Number(patientId) },
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (error || !data) {
        return NextResponse.json(error ?? { error: "Failed to fetch schedules" }, { status: 500 });
    }

    return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
    const accessToken = await getAccessToken();
    if (!accessToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();

    const { data, error } = await notificationsSchedulesCreate({
        body,
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (error || !data) {
        return NextResponse.json(error ?? { error: "Failed to save schedule" }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
}
