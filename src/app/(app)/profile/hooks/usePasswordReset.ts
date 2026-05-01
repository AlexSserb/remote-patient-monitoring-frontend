"use client";

import { useState } from "react";

interface UsePasswordResetReturn {
    sendOtp: () => Promise<boolean>;
    resetPassword: (otp: string, newPassword: string) => Promise<boolean>;
    isLoading: boolean;
    error: string | null;
    resetError: () => void;
}

export function usePasswordReset(): UsePasswordResetReturn {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const sendOtp = (): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        return fetch("/api/profile/password-reset", { method: "POST" })
            .then(res => {
                if (!res.ok) {
                    setError("Не удалось отправить код. Попробуйте позже.");
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

    const resetPassword = (otp: string, newPassword: string): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        return fetch("/api/profile/password-reset/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ otp, newPassword }),
        })
            .then(res => {
                if (!res.ok) {
                    return res.json().then(data => {
                        const msg =
                            data?.nonFieldErrors?.[0] ??
                            data?.newPassword?.[0] ??
                            data?.otp?.[0] ??
                            "Не удалось сменить пароль. Попробуйте позже.";
                        setError(msg);
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

    const resetError = () => setError(null);

    return { sendOtp, resetPassword, isLoading, error, resetError };
}
