import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { diagnosesAnalyticsRetrieve } from "@/client/sdk.gen";
import { decodeJwtPayload } from "@/lib/jwt";

export async function GET(request: NextRequest) {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    if (!accessToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        decodeJwtPayload(accessToken);
    } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const patientId = searchParams.get("patient_id");
    const dateFrom = searchParams.get("date_from");
    const dateTo = searchParams.get("date_to");
    const metricIds = searchParams.get("metric_ids");

    const { data, error } = await diagnosesAnalyticsRetrieve({
        query: {
            patient_id: patientId ? Number(patientId) : undefined,
            date_from: dateFrom ?? undefined,
            date_to: dateTo ?? undefined,
            metric_ids: metricIds ?? undefined,
        },
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (error || !data) {
        return NextResponse.json(error ?? { error: "Failed to fetch analytics" }, { status: 500 });
    }

    return NextResponse.json(data);
}
