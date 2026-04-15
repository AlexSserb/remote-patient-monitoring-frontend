"use client";

import { useEffect, useState } from "react";
import type { PatientListItem } from "@/client/types.gen";

export type HasCaregiverFilter = "all" | "yes" | "no";

interface UsePatientsPageParams {
    attached: boolean;
    hasCaregiver: HasCaregiverFilter;
    search: string;
    page: number;
    pageSize: number;
}

interface UsePatientsPageResult {
    patients: PatientListItem[];
    total: number;
    isLoading: boolean;
    error: string | null;
}

export function usePatientsPage({
    attached,
    hasCaregiver,
    search,
    page,
    pageSize,
}: UsePatientsPageParams): UsePatientsPageResult {
    const [patients, setPatients] = useState<PatientListItem[]>([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setIsLoading(true);
        setError(null);

        const params = new URLSearchParams({
            page: String(page),
            page_size: String(pageSize),
            has_caregiver: hasCaregiver,
        });
        if (attached) params.set("attached", "true");
        if (search) params.set("search", search);

        fetch(`/api/patients?${params.toString()}`)
            .then(res => (res.ok ? res.json() : Promise.reject(res.status)))
            .then((data: { count: number; results: PatientListItem[] }) => {
                setPatients(data.results);
                setTotal(data.count);
            })
            .catch(() => setError("Не удалось загрузить список пациентов. Попробуйте позже."))
            .finally(() => setIsLoading(false));
    }, [attached, hasCaregiver, search, page, pageSize]);

    return { patients, total, isLoading, error };
}
