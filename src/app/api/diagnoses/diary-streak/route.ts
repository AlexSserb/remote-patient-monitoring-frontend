import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { diagnosesDiaryStreakRetrieve } from "@/client/sdk.gen";
import { decodeJwtPayload } from "@/lib/jwt";

export async function GET(request: NextRequest) {
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

    const { searchParams } = request.nextUrl;
    const patientId = searchParams.get("patient_id");

    const { data, error } = await diagnosesDiaryStreakRetrieve({
        query: patientId ? { patient_id: Number(patientId) } : undefined,
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (error || !data) {
        return NextResponse.json(error ?? { error: "Failed to fetch streak" }, { status: 500 });
    }

    return NextResponse.json(data);
}
