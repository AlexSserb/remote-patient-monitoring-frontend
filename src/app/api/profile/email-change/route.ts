import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { decodeJwtPayload } from "@/lib/jwt";
import { usersEmailChangeCreate } from "@/client/sdk.gen";
import type { EmailChangeRequest } from "@/client/types.gen";

// POST /api/profile/email-change — validate new email and send OTP to it
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

    const body: EmailChangeRequest = await request.json();

    const { error } = await usersEmailChangeCreate({
        path: { user_id: userId },
        body,
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (error) {
        return NextResponse.json(error, { status: 400 });
    }

    return new NextResponse(null, { status: 204 });
}
