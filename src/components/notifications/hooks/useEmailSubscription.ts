"use client";

import { useEffect, useState } from "react";

export type EmailState = "loading" | "enabled" | "disabled";

interface UseEmailSubscriptionResult {
    state: EmailState;
    error: string | null;
    enable: () => Promise<void>;
    disable: () => Promise<void>;
}

export function useEmailSubscription(userId: number | null): UseEmailSubscriptionResult {
    const [state, setState] = useState<EmailState>("loading");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (userId === null) {
            setState("disabled");
            return;
        }
        setState("loading");
        fetch(`/api/notifications/email-subscription?userId=${userId.toString()}`)
            .then(res => {
                if (!res.ok) throw new Error();
                return res.json() as Promise<{ isActive: boolean }>;
            })
            .then(data => setState(data.isActive ? "enabled" : "disabled"))
            .catch(() => setState("disabled"));
    }, [userId]);

    async function enable(): Promise<void> {
        if (userId === null) return;
        setState("loading");
        setError(null);
        try {
            const res = await fetch(`/api/notifications/email-subscription?userId=${userId.toString()}`, {
                method: "POST",
            });
            if (!res.ok) throw new Error(`Server error ${res.status.toString()}`);
            setState("enabled");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Не удалось включить email-уведомления");
            setState("disabled");
        }
    }

    async function disable(): Promise<void> {
        if (userId === null) return;
        setState("loading");
        setError(null);
        try {
            const res = await fetch(`/api/notifications/email-subscription?userId=${userId.toString()}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error(`Server error ${res.status.toString()}`);
            setState("disabled");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Не удалось отключить email-уведомления");
            setState("enabled");
        }
    }

    return { state, error, enable, disable };
}