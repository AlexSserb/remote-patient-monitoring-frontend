"use client";

import { useEffect, useState } from "react";
import type { NotificationSchedule } from "@/client/types.gen";

interface UseNotificationSchedulesResult {
    schedules: NotificationSchedule[];
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
}

export function useNotificationSchedules(patientId: number | null): UseNotificationSchedulesResult {
    const [schedules, setSchedules] = useState<NotificationSchedule[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [tick, setTick] = useState(0);

    useEffect(() => {
        if (patientId === null) return;

        setIsLoading(true);
        setError(null);

        fetch(`/api/notifications/schedules?patientId=${patientId}`)
            .then(res => (res.ok ? res.json() : Promise.reject(res.status)))
            .then((data: NotificationSchedule[]) => setSchedules(data))
            .catch(() => setError("Не удалось загрузить настройки уведомлений."))
            .finally(() => setIsLoading(false));
    }, [patientId, tick]);

    function refetch() {
        setTick(t => t + 1);
    }

    return { schedules, isLoading, error, refetch };
}
