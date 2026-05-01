import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { diagnosesDiaryFieldsList } from "@/client/sdk.gen";
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

    const patientIdParam = request.nextUrl.searchParams.get("patient_id");
    const patientId = patientIdParam ? Number(patientIdParam) : undefined;

    const { data, error } = await diagnosesDiaryFieldsList({
        headers: { Authorization: `Bearer ${accessToken}` },
        query: patientId !== undefined ? { patient_id: patientId } : undefined,
    });

    if (error || !data) {
        return NextResponse.json(error ?? { error: "Failed to fetch diary fields" }, { status: 500 });
    }

    return NextResponse.json(data);
}
