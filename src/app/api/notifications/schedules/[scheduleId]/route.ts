import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { notificationsSchedulesPartialUpdate } from "@/client/sdk.gen";

export async function PATCH(request: NextRequest, props: { params: Promise<{ scheduleId: string }> }) {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;
    if (!accessToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { scheduleId } = await props.params;
    const body = await request.json();

    const { data, error } = await notificationsSchedulesPartialUpdate({
        path: { scheduleId: Number(scheduleId) },
        body,
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (error || !data) {
        return NextResponse.json(error ?? { error: "Failed to update schedule" }, { status: 500 });
    }

    return NextResponse.json(data);
}
