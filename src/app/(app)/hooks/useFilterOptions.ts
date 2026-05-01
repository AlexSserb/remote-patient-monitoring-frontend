"use client";

import { useEffect, useState } from "react";
import type { DiagnosisShort, UserShort } from "@/client/types.gen";

interface SelectOption {
    value: string;
    label: string;
}

interface FilterOptionsResult {
    options: SelectOption[];
    isLoading: boolean;
}

function toUserOptions(users: UserShort[]): SelectOption[] {
    return users.map(u => ({ value: String(u.id), label: `${u.lastName} ${u.firstName}` }));
}

function toDiagnosisOptions(diagnoses: DiagnosisShort[]): SelectOption[] {
    return diagnoses.map(d => ({ value: String(d.id), label: `${d.code} — ${d.name}` }));
}

function useJsonListOptions<T>(url: string, transform: (data: T[]) => SelectOption[]): FilterOptionsResult {
    const [options, setOptions] = useState<SelectOption[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch(url)
            .then(res => (res.ok ? res.json() : Promise.reject(res.status)))
            .then((data: T[]) => setOptions(transform(data)))
            .catch(() => setOptions([]))
            .finally(() => setIsLoading(false));
        // transform is stable (defined outside component), url never changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url]);

    return { options, isLoading };
}

export function useCaregiversOptions(): FilterOptionsResult {
    return useJsonListOptions<UserShort>("/api/caregivers", toUserOptions);
}

export function useDoctorsOptions(): FilterOptionsResult {
    return useJsonListOptions<UserShort>("/api/doctors", toUserOptions);
}

export function useDiagnosesOptions(): FilterOptionsResult {
    return useJsonListOptions<DiagnosisShort>("/api/diagnoses", toDiagnosisOptions);
}
