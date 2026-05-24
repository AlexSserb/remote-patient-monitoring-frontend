"use client";

import { useEffect, useState } from "react";

export type InAppSubscriptionState = "loading" | "enabled" | "disabled";

interface UseInAppSubscriptionResult {
    state: InAppSubscriptionState;
    error: string | null;
    enable: () => Promise<void>;
    disable: () => Promise<void>;
}

export function useInAppSubscription(userId: number | null): UseInAppSubscriptionResult {
    const [state, setState] = useState<InAppSubscriptionState>("loading");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (userId === null) {
            setState("enabled");
            return;
        }
        setState("loading");
        fetch(`/api/notifications/in-app-subscription?userId=${userId.toString()}`)
            .then(res => {
                if (!res.ok) throw new Error();
                return res.json() as Promise<{ isActive: boolean }>;
            })
            .then(data => setState(data.isActive ? "enabled" : "disabled"))
            .catch(() => setState("enabled"));
    }, [userId]);

    async function enable(): Promise<void> {
        if (userId === null) return;
        setState("loading");
        setError(null);
        try {
            const res = await fetch(`/api/notifications/in-app-subscription?userId=${userId.toString()}`, {
                method: "POST",
            });
            if (!res.ok) throw new Error(`Server error ${res.status.toString()}`);
            setState("enabled");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Не удалось включить уведомления в приложении");
            setState("disabled");
        }
    }

    async function disable(): Promise<void> {
        if (userId === null) return;
        setState("loading");
        setError(null);
        try {
            const res = await fetch(`/api/notifications/in-app-subscription?userId=${userId.toString()}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error(`Server error ${res.status.toString()}`);
            setState("disabled");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Не удалось отключить уведомления в приложении");
            setState("enabled");
        }
    }

    return { state, error, enable, disable };
}