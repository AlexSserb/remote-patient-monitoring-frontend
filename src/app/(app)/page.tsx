import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { decodeJwtPayload, isTokenExpired } from "@/lib/jwt";
import { usersRetrieve } from "@/client/sdk.gen";
import { PatientsTable } from "./components/PatientsTable";

export const metadata: Metadata = {
    title: "Главная",
};

export default async function HomePage() {
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
        path: { user_id: userId },
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (error || !profile) redirect("/login");

    if (profile.role === "doctor" || profile.role === "caregiver") {
        return <PatientsTable role={profile.role} />;
    }

    // Пациенты: страница будет заполнена позже
    return null;
}
