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

    const verifyOtp = async (preAuthToken: string, otp: string): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        try {
            const { data, error: apiError } = await usersAuthVerifyOtpCreate({
                body: { pre_auth_token: preAuthToken, otp },
            });

            if (apiError || !data) {
                setError("Неверный или просроченный код");
                return false;
            }

            const tokens = data as VerifyOtpResponse;

            const res = await fetch("/api/auth/session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ access: tokens.access, refresh: tokens.refresh }),
            });

            return res.ok;
        } catch {
            setError("Ошибка соединения. Попробуйте позже.");
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return { verifyOtp, isLoading, error };
}
