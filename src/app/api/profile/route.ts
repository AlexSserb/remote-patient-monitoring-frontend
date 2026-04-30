import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { decodeJwtPayload } from "@/lib/jwt";
import { usersPartialUpdate } from "@/client/sdk.gen";
import type { PatchedUpdateProfile } from "@/client/types.gen";

// PATCH /api/profile — update first_name and last_name
export async function PATCH(request: NextRequest) {
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

    const body: PatchedUpdateProfile = await request.json();

    const { data, error } = await usersPartialUpdate({
        path: { userId },
        body,
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (error || !data) {
        return NextResponse.json(error ?? { error: "Bad request" }, { status: 400 });
    }

    return NextResponse.json(data);
}
