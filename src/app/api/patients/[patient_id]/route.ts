import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { usersPatientsPartialUpdate } from "@/client/sdk.gen";
import { decodeJwtPayload } from "@/lib/jwt";
import type { PatchedEditPatient } from "@/client/types.gen";

// PATCH /api/patients/[patient_id] — proxy with auth header
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ patient_id: string }> }) {
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

    const { patient_id } = await params;
    const body: PatchedEditPatient = await request.json();

    const { data, error } = await usersPatientsPartialUpdate({
        path: { patientId: Number(patient_id) },
        body,
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (error || !data) {
        return NextResponse.json(error ?? { error: "Failed to update patient" }, { status: 400 });
    }

    return NextResponse.json(data);
}
