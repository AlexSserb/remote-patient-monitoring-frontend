"use client";

import { useState } from "react";

interface UseEmailChangeReturn {
    requestChange: (newEmail: string) => Promise<boolean>;
    verifyChange: (otp: string) => Promise<boolean>;
    isLoading: boolean;
    error: string | null;
    resetError: () => void;
}

export function useEmailChange(): UseEmailChangeReturn {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const requestChange = (newEmail: string): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        return fetch("/api/profile/email-change", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ new_email: newEmail }),
        })
            .then(res => {
                if (!res.ok) {
                    return res.json().then(data => {
                        setError(data?.new_email?.[0] ?? "Не удалось отправить код. Попробуйте позже.");
                        return false;
                    });
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

    const verifyChange = (otp: string): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        return fetch("/api/profile/email-change/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ otp }),
        })
            .then(res => {
                if (!res.ok) {
                    setError("Неверный или истёкший код подтверждения.");
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

    const resetError = () => setError(null);

    return { requestChange, verifyChange, isLoading, error, resetError };
}
