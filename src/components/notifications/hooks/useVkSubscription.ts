"use client";

import { useCallback, useEffect, useState } from "react";

export type VkState = "loading" | "enabled" | "disabled";

interface UseVkSubscriptionResult {
    state: VkState;
    error: string | null;
    disable: () => Promise<void>;
    generateToken: () => Promise<{ token: string; expiresIn: number } | null>;
    refetchStatus: () => void;
}

export function useVkSubscription(userId: number | null): UseVkSubscriptionResult {
    const [state, setState] = useState<VkState>("loading");
    const [error, setError] = useState<string | null>(null);
    const [tick, setTick] = useState(0);

    useEffect(() => {
        if (userId === null) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setState("disabled");
            return;
        }
        setState("loading");
        fetch(`/api/notifications/vk-subscription?userId=${userId.toString()}`)
            .then(res => {
                if (!res.ok) throw new Error();
                return res.json() as Promise<{ isActive: boolean }>;
            })
            .then(data => setState(data.isActive ? "enabled" : "disabled"))
            .catch(() => setState("disabled"));
    }, [userId, tick]);

    const refetchStatus = useCallback(() => {
        setTick(t => t + 1);
    }, []);

    const disable = useCallback(async (): Promise<void> => {
        if (userId === null) return;
        setState("loading");
        setError(null);
        try {
            const res = await fetch(`/api/notifications/vk-subscription?userId=${userId.toString()}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error(`Server error ${res.status.toString()}`);
            setState("disabled");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Не удалось отключить VK-уведомления");
            setState("enabled");
        }
    }, [userId]);

    const generateToken = useCallback(async (): Promise<{ token: string; expiresIn: number } | null> => {
        if (userId === null) return null;
        setError(null);
        try {
            const res = await fetch(
                `/api/notifications/vk-subscription/generate-token?userId=${userId.toString()}`,
                { method: "POST" },
            );
            if (!res.ok) throw new Error(`Server error ${res.status.toString()}`);
            const data = (await res.json()) as { token: string; expiresIn: number };
            return data;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Не удалось сгенерировать токен");
            return null;
        }
    }, [userId]);

    return { state, error, disable, generateToken, refetchStatus };
}