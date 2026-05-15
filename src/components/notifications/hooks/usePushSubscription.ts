"use client";

import { useEffect, useState } from "react";

export type PushState = "unsupported" | "denied" | "subscribed" | "unsubscribed" | "loading";

interface UsePushSubscriptionResult {
    state: PushState;
    error: string | null;
    subscribe: () => Promise<void>;
    unsubscribe: () => Promise<void>;
}

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
    const padding = "=".repeat((4 - (base64.length % 4)) % 4);
    const normalized = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = atob(normalized);
    const bytes = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; i++) {
        bytes[i] = rawData.charCodeAt(i);
    }
    return bytes;
}

async function fetchVapidPublicKey(): Promise<string> {
    const res = await fetch("/api/notifications/vapid-public-key");
    if (!res.ok) throw new Error("Failed to fetch VAPID key");
    const data = (await res.json()) as { publicKey: string };
    return data.publicKey;
}

export function usePushSubscription(): UsePushSubscriptionResult {
    const [state, setState] = useState<PushState>("loading");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
            setState("unsupported");
            return;
        }
        if (Notification.permission === "denied") {
            setState("denied");
            return;
        }
        navigator.serviceWorker
            .register("/sw.js")
            .then(reg => reg.pushManager.getSubscription())
            .then(sub => setState(sub ? "subscribed" : "unsubscribed"))
            .catch(() => setState("unsupported"));
    }, []);

    async function subscribe(): Promise<void> {
        setState("loading");
        setError(null);
        try {
            const registration = await navigator.serviceWorker.ready;
            const vapidKey = await fetchVapidPublicKey();
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidKey),
            });
            const res = await fetch("/api/notifications/push-subscription", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(subscription.toJSON()),
            });
            if (!res.ok) throw new Error(`Server error ${res.status.toString()}`);
            setState("subscribed");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Не удалось включить push-уведомления");
            setState(Notification.permission === "denied" ? "denied" : "unsubscribed");
        }
    }

    async function unsubscribe(): Promise<void> {
        setState("loading");
        setError(null);
        try {
            const res = await fetch("/api/notifications/push-subscription", { method: "DELETE" });
            if (!res.ok) throw new Error(`Server error ${res.status.toString()}`);
            const registration = await navigator.serviceWorker.ready;
            const sub = await registration.pushManager.getSubscription();
            await sub?.unsubscribe();
            setState("unsubscribed");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Не удалось отключить push-уведомления");
            setState("subscribed");
        }
    }

    return { state, error, subscribe, unsubscribe };
}
