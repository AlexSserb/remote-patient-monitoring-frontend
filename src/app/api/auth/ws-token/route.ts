import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { decodeJwtPayload, isTokenExpired } from "@/lib/jwt";

export async function GET() {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    if (!accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const payload = decodeJwtPayload(accessToken);
        if (isTokenExpired(payload)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
    } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ token: accessToken });
}
