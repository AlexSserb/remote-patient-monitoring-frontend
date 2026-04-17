import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { decodeJwtPayload } from "@/lib/jwt";
import { usersPasswordResetCreate } from "@/client/sdk.gen";

// POST /api/profile/password-reset — send OTP to current email
export async function POST() {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    if (!accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let userId: number;
    try {
        userId = decodeJwtPayload(accessToken).user_id;
    } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await usersPasswordResetCreate({
        path: { user_id: userId },
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (error) {
        return NextResponse.json(error, { status: 400 });
    }

    return new NextResponse(null, { status: 204 });
}
