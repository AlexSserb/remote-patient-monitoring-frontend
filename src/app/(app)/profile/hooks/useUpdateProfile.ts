"use client";

import { useState } from "react";

interface UpdateProfilePayload {
    first_name: string;
    last_name: string;
}

interface UseUpdateProfileReturn {
    updateProfile: (payload: UpdateProfilePayload) => Promise<boolean>;
    isLoading: boolean;
    error: string | null;
}

export function useUpdateProfile(): UseUpdateProfileReturn {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateProfile = (payload: UpdateProfilePayload): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        return fetch("/api/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        })
            .then((res) => {
                if (!res.ok) {
                    setError("Не удалось сохранить изменения. Попробуйте позже.");
                    return false;
                }
                return true;
            })
            .catch(() => {
                setError("Ошибка соединения. Попробуйте позже.");
                return false;
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    return { updateProfile, isLoading, error };
}