import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { decodeJwtPayload, isTokenExpired } from "@/lib/jwt";
import { usersRetrieve } from "@/client/sdk.gen";
import { ProfileInfo } from "./components/ProfileInfo";

export const metadata: Metadata = {
    title: "Профиль",
};

export default async function ProfilePage() {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    if (!accessToken) redirect("/login");

    let userId: number;
    try {
        const payload = decodeJwtPayload(accessToken);
        if (isTokenExpired(payload)) redirect("/login");
        userId = payload.user_id;
    } catch {
        redirect("/login");
    }

    const { data: profile, error } = await usersRetrieve({
        path: { userId },
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (error || !profile) redirect("/login");

    return <ProfileInfo profile={profile} />;
}
