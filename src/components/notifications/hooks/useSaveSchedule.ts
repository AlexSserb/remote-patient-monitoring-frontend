"use client";

import { useState } from "react";
import type {
    NotificationSchedule,
    NotificationScheduleCreate,
    PatchedNotificationScheduleUpdate,
} from "@/client/types.gen";

interface SaveSchedulePayload {
    id?: number;
    patientId: number;
    recipientId?: number;
    daysOfWeek: number[];
    times: string[];
    isEnabled: boolean;
}

interface UseSaveScheduleResult {
    save: (payload: SaveSchedulePayload) => Promise<NotificationSchedule | null>;
    isLoading: boolean;
    error: string | null;
}

export function useSaveSchedule(): UseSaveScheduleResult {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function save(payload: SaveSchedulePayload): Promise<NotificationSchedule | null> {
        setIsLoading(true);
        setError(null);

        const promise =
            payload.id !== undefined
                ? patch(payload.id, {
                      daysOfWeek: payload.daysOfWeek,
                      times: payload.times,
                      isEnabled: payload.isEnabled,
                  })
                : post({
                      patientId: payload.patientId,
                      recipientId: payload.recipientId,
                      daysOfWeek: payload.daysOfWeek,
                      times: payload.times,
                      isEnabled: payload.isEnabled,
                  });

        return promise
            .then(res => (res.ok ? (res.json() as Promise<NotificationSchedule>) : Promise.reject(res.status)))
            .catch(() => {
                setError("Не удалось сохранить расписание. Попробуйте снова.");
                return null;
            })
            .finally(() => setIsLoading(false));
    }

    return { save, isLoading, error };
}

function post(body: NotificationScheduleCreate): Promise<Response> {
    return fetch("/api/notifications/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
}

function patch(scheduleId: number, body: PatchedNotificationScheduleUpdate): Promise<Response> {
    return fetch(`/api/notifications/schedules/${scheduleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
}
