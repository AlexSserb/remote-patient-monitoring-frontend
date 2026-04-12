import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { decodeJwtPayload, isTokenExpired } from "@/lib/jwt";
import type { UserProfile } from "@/client/types.gen";
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

    const response = await fetch(`http://127.0.0.1:8000/api/users/${userId}/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
    });

    if (!response.ok) redirect("/login");

    const profile: UserProfile = await response.json();

    return <ProfileInfo profile={profile} />;
}