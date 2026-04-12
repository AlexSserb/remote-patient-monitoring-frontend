"use client";

import { useState } from "react";
import { usersAuthLoginCreate } from "@/client/sdk.gen";

interface LoginResponse {
    pre_auth_token: string;
}

interface UseLoginReturn {
    login: (email: string, password: string) => Promise<string | null>;
    isLoading: boolean;
    error: string | null;
}

export function useLogin(): UseLoginReturn {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const login = async (email: string, password: string): Promise<string | null> => {
        setIsLoading(true);
        setError(null);

        try {
            const { data, error: apiError } = await usersAuthLoginCreate({
                body: { email, password },
            });

            if (apiError || !data) {
                setError("Неверный email или пароль");
                return null;
            }

            return (data as LoginResponse).pre_auth_token;
        } catch {
            setError("Ошибка соединения. Попробуйте позже.");
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return { login, isLoading, error };
}
