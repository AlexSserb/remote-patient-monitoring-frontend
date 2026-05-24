import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { usersPatientsList } from "@/client/sdk.gen";
import { decodeJwtPayload } from "@/lib/jwt";

// GET /api/patients — proxy to Django with auth header, forwarding filter/pagination params
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

    const attached = searchParams.get("attached");
    const hasCaregiver = searchParams.get("hasCaregiver");
    const search = searchParams.get("search");
    const page = searchParams.get("page");
    const pageSize = searchParams.get("pageSize");
    const caregivers = searchParams.getAll("caregivers").map(Number).filter(Boolean);
    const doctors = searchParams.getAll("doctors").map(Number).filter(Boolean);
    const diagnoses = searchParams.getAll("diagnoses").map(Number).filter(Boolean);

    const { data, error } = await usersPatientsList({
        query: {
            attached: attached === "true" ? true : attached === "false" ? false : undefined,
            has_caregiver: (hasCaregiver as "all" | "yes" | "no" | null) ?? undefined,
            search: search ?? undefined,
            page: page ? Number(page) : undefined,
            page_size: pageSize ? Number(pageSize) : undefined,
            caregivers: caregivers.length ? caregivers : undefined,
            doctors: doctors.length ? doctors : undefined,
            diagnoses: diagnoses.length ? diagnoses : undefined,
        },
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (error || !data) {
        return NextResponse.json(error ?? { error: "Failed to fetch patients" }, { status: 500 });
    }

    return NextResponse.json(data);
}
