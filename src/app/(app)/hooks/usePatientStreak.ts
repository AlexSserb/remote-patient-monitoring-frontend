"use client";

import { useEffect, useState } from "react";
import type { PatientStreak } from "@/client/types.gen";

interface UsePatientStreakResult {
    streak: PatientStreak | null;
    isLoading: boolean;
    error: string | null;
}

export function usePatientStreak(patientId?: number, refreshKey?: number, enabled = true): UsePatientStreakResult {
    const [streak, setStreak] = useState<PatientStreak | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!enabled) return;

        setIsLoading(true);
        setError(null);

        const url =
            patientId !== undefined
                ? `/api/diagnoses/diary-streak?patient_id=${patientId}`
                : "/api/diagnoses/diary-streak";

        fetch(url)
            .then(res => (res.ok ? res.json() : Promise.reject(res.status)))
            .then((data: PatientStreak) => setStreak(data))
            .catch(() => setError("Не удалось загрузить серию."))
            .finally(() => setIsLoading(false));
    }, [patientId, refreshKey, enabled]);

    return { streak, isLoading, error };
}
