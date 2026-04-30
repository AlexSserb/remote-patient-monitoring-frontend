"use client";

import { useEffect, useState } from "react";
import type { DiaryField } from "@/client/types.gen";

interface UseDiaryFieldsResult {
    fields: DiaryField[];
    isLoading: boolean;
    error: string | null;
}

export function useDiaryFields(patientId?: number): UseDiaryFieldsResult {
    const [fields, setFields] = useState<DiaryField[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setIsLoading(true);
        setError(null);

        const url = patientId !== undefined ? `/api/diary-fields?patient_id=${patientId}` : "/api/diary-fields";

        fetch(url)
            .then(res => (res.ok ? res.json() : Promise.reject(res.status)))
            .then((data: DiaryField[]) => setFields(data))
            .catch(() => setError("Не удалось загрузить поля дневника."))
            .finally(() => setIsLoading(false));
    }, [patientId]);

    return { fields, isLoading, error };
}
