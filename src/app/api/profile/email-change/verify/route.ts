import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { decodeJwtPayload } from "@/lib/jwt";
import { usersEmailChangeVerifyCreate } from "@/client/sdk.gen";
import type { EmailChangeVerify } from "@/client/types.gen";

// POST /api/profile/email-change/verify — verify OTP and apply new email
export async function POST(request: NextRequest) {
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

    const body: EmailChangeVerify = await request.json();

    const { data, error } = await usersEmailChangeVerifyCreate({
        path: { user_id: userId },
        body,
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (error || !data) {
        return NextResponse.json(error ?? { error: "Bad request" }, { status: 400 });
    }

    return NextResponse.json(data);
}
