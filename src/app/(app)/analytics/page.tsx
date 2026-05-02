import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { decodeJwtPayload, isTokenExpired } from "@/lib/jwt";
import { AnalyticsContent } from "./components/AnalyticsContent";

export const metadata: Metadata = {
    title: "Аналитика",
};

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ patientId?: string }> }) {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    if (!accessToken) redirect("/login");

    try {
        const payload = decodeJwtPayload(accessToken);
        if (isTokenExpired(payload)) redirect("/login");
    } catch {
        redirect("/login");
    }

    const { patientId: patientIdStr } = await searchParams;
    const patientId = patientIdStr ? Number(patientIdStr) : undefined;

    return <AnalyticsContent patientId={patientId} />;
}
