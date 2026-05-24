import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { diagnosesList } from "@/client/sdk.gen";
import { decodeJwtPayload } from "@/lib/jwt";

export async function GET() {
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

    const { data, error } = await diagnosesList({
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (error || !data) {
        return NextResponse.json(error ?? { error: "Failed to fetch diagnoses" }, { status: 500 });
    }

    return NextResponse.json(data);
}
