import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { usersAuthTokenRefreshCreate } from "@/client/sdk.gen";
import { decodeJwtPayload } from "@/lib/jwt";

const COOKIE_BASE = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
};

// POST /api/auth/session/refresh — rotate token pair using refresh cookie
export async function POST() {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refresh_token")?.value;

    if (!refreshToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await usersAuthTokenRefreshCreate({
        body: { refresh: refreshToken },
    });

    if (error || !data) {
        cookieStore.delete("access_token");
        cookieStore.delete("refresh_token");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tokens = data as { access: string; refresh: string };
    const accessPayload = decodeJwtPayload(tokens.access);
    const refreshPayload = decodeJwtPayload(tokens.refresh);

    cookieStore.set("access_token", tokens.access, {
        ...COOKIE_BASE,
        maxAge: accessPayload.exp - Math.floor(Date.now() / 1000),
    });

    cookieStore.set("refresh_token", tokens.refresh, {
        ...COOKIE_BASE,
        maxAge: refreshPayload.exp - Math.floor(Date.now() / 1000),
    });

    return NextResponse.json({
        userId: accessPayload.user_id,
        email: accessPayload.email,
    });
}
