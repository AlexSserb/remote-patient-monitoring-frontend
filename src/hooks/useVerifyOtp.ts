"use client";

import { useState } from "react";
import { usersAuthVerifyOtpCreate } from "@/client/sdk.gen";

interface VerifyOtpResponse {
    access: string;
    refresh: string;
}

interface UseVerifyOtpReturn {
    verifyOtp: (preAuthToken: string, otp: string) => Promise<boolean>;
    isLoading: boolean;
    error: string | null;
}

export function useVerifyOtp(): UseVerifyOtpReturn {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const verifyOtp = (preAuthToken: string, otp: string): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        return usersAuthVerifyOtpCreate({ body: { pre_auth_token: preAuthToken, otp } })
            .then(({ data, error: apiError }) => {
                if (apiError || !data) {
                    setError("Неверный или просроченный код");
                    return false;
                }

                const tokens = data as VerifyOtpResponse;

                return fetch("/api/auth/session", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ access: tokens.access, refresh: tokens.refresh }),
                }).then((res) => res.ok);
            })
            .catch(() => {
                setError("Ошибка соединения. Попробуйте позже.");
                return false;
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    return { verifyOtp, isLoading, error };
}