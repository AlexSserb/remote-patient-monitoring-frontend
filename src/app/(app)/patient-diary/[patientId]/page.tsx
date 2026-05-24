import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { decodeJwtPayload, isTokenExpired } from "@/lib/jwt";
import { PatientDashboard } from "../../components/PatientDashboard";

export const metadata: Metadata = {
    title: "Дневник пациента",
};

export default async function PatientDiaryPage({ params }: { params: Promise<{ patientId: string }> }) {
    const { patientId: patientIdStr } = await params;
    const patientId = Number(patientIdStr);
    if (!Number.isInteger(patientId) || patientId <= 0) notFound();

    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    if (!accessToken) redirect("/login");

    try {
        const payload = decodeJwtPayload(accessToken);
        if (isTokenExpired(payload)) redirect("/login");
    } catch {
        redirect("/login");
    }

    return <PatientDashboard patientId={patientId} />;
}
