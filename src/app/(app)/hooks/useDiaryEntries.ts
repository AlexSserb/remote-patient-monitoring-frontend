"use client";

import { useEffect, useState } from "react";
import type { DiaryEntryInfo } from "@/client/types.gen";

interface UseDiaryEntriesResult {
    entries: DiaryEntryInfo[];
    isLoading: boolean;
    error: string | null;
}

export function useDiaryEntries(refreshKey: number): UseDiaryEntriesResult {
    const [entries, setEntries] = useState<DiaryEntryInfo[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setIsLoading(true);
        setError(null);

        fetch("/api/diary-entries")
            .then(res => (res.ok ? res.json() : Promise.reject(res.status)))
            .then((data: DiaryEntryInfo[]) => setEntries(data))
            .catch(() => setError("Не удалось загрузить записи дневника."))
            .finally(() => setIsLoading(false));
    }, [refreshKey]);

    return { entries, isLoading, error };
}
