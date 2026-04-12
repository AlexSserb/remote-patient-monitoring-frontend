import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { usersAuthLogoutCreate } from "@/client/sdk.gen";
import { decodeJwtPayload, isTokenExpired } from "@/lib/jwt";

const COOKIE_BASE = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
};

// GET /api/auth/session — decode access token and return user payload
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
        return NextResponse.json({ userId: payload.user_id, email: payload.email });
    } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}

// POST /api/auth/session — store JWT pair as httpOnly cookies
export async function POST(request: NextRequest) {
    const { access, refresh } = await request.json();

    const cookieStore = await cookies();
    const accessPayload = decodeJwtPayload(access);
    const refreshPayload = decodeJwtPayload(refresh);

    cookieStore.set("access_token", access, {
        ...COOKIE_BASE,
        maxAge: accessPayload.exp - Math.floor(Date.now() / 1000),
    });

    cookieStore.set("refresh_token", refresh, {
        ...COOKIE_BASE,
        maxAge: refreshPayload.exp - Math.floor(Date.now() / 1000),
    });

    return NextResponse.json({ ok: true });
}

// DELETE /api/auth/session — blacklist refresh token and clear cookies
export async function DELETE() {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refresh_token")?.value;

    if (refreshToken) {
        // Fire-and-forget: best-effort blacklist; session is cleared regardless
        await usersAuthLogoutCreate({ body: { refresh: refreshToken } }).catch(() => {});
    }

    cookieStore.delete("access_token");
    cookieStore.delete("refresh_token");

    return NextResponse.json({ ok: true });
}
