"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { notifications } from "@mantine/notifications";

export interface InAppNotification {
    id: number;
    title: string;
    body: string;
    isRead: boolean;
    sentAt: string;
}

interface InAppNotificationListResponse {
    results: InAppNotification[];
    count: number;
    unreadCount: number;
    hasMore: boolean;
}

interface WsInitEvent {
    type: "init";
    unreadCount: number;
}

interface WsUnreadCountEvent {
    type: "unreadCount";
    unreadCount: number;
}

interface WsNewNotificationEvent {
    type: "notification.new";
    notification: InAppNotification;
}

type WsEvent = WsInitEvent | WsUnreadCountEvent | WsNewNotificationEvent;

export interface UseInAppNotificationsReturn {
    unreadCount: number;
    items: InAppNotification[];
    isLoading: boolean;
    hasMore: boolean;
    loadNotifications: () => void;
    loadMore: () => void;
    markRead: (id: number) => void;
    markAllRead: () => void;
}

function buildWsUrl(token: string): string {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";
    const wsBase = apiUrl.replace(/^http/, "ws");
    return `${wsBase}/ws/notifications/?token=${token}`;
}

export function useInAppNotifications(): UseInAppNotificationsReturn {
    const [unreadCount, setUnreadCount] = useState(0);
    const [items, setItems] = useState<InAppNotification[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [offset, setOffset] = useState(0);

    const wsRef = useRef<WebSocket | null>(null);
    // Флаг: список уже загружен, новые уведомления добавляем в начало
    const loadedRef = useRef(false);

    const wsSend = useCallback((data: object) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(data));
        }
    }, []);

    const loadNotifications = useCallback(() => {
        if (isLoading) return;
        setIsLoading(true);
        fetch("/api/notifications/in-app/?limit=20&offset=0")
            .then(res => (res.ok ? (res.json() as Promise<InAppNotificationListResponse>) : Promise.reject(res.status)))
            .then(page => {
                setItems(page.results);
                setHasMore(page.hasMore);
                setUnreadCount(page.unreadCount);
                setOffset(20);
                loadedRef.current = true;
            })
            .catch(() => {})
            .finally(() => setIsLoading(false));
    }, [isLoading]);

    const loadMore = useCallback(() => {
        if (isLoading || !hasMore) return;
        setIsLoading(true);
        fetch(`/api/notifications/in-app/?limit=20&offset=${offset.toString()}`)
            .then(res => (res.ok ? (res.json() as Promise<InAppNotificationListResponse>) : Promise.reject(res.status)))
            .then(page => {
                setItems(prev => [...prev, ...page.results]);
                setHasMore(page.hasMore);
                setOffset(prev => prev + 20);
            })
            .catch(() => {})
            .finally(() => setIsLoading(false));
    }, [isLoading, hasMore, offset]);

    const markRead = useCallback(
        (id: number) => {
            wsSend({ type: "mark_read", id });
            setItems(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)));
        },
        [wsSend],
    );

    const markAllRead = useCallback(() => {
        wsSend({ type: "mark_all_read" });
        setItems(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
    }, [wsSend]);

    useEffect(() => {
        let ws: WebSocket | null = null;
        let cancelled = false;

        fetch("/api/auth/ws-token")
            .then(res => (res.ok ? (res.json() as Promise<{ token: string }>) : Promise.reject(res.status)))
            .then(({ token }) => {
                if (cancelled) return;
                ws = new WebSocket(buildWsUrl(token));
                wsRef.current = ws;

                ws.onmessage = event => {
                    try {
                        const data = JSON.parse(event.data as string) as WsEvent;

                        if (data.type === "init") {
                            setUnreadCount(data.unreadCount);
                        } else if (data.type === "unreadCount") {
                            setUnreadCount(data.unreadCount);
                        } else if (data.type === "notification.new") {
                            const n = data.notification;
                            setUnreadCount(prev => prev + 1);
                            if (loadedRef.current) {
                                setItems(prev => [n, ...prev]);
                            }
                            notifications.show({
                                title: n.title,
                                message: n.body,
                                color: "blue",
                                autoClose: 6000,
                            });
                        }
                    } catch {
                        // Некорректный фрейм — игнорируем
                    }
                };
            })
            .catch(() => {});

        return () => {
            cancelled = true;
            ws?.close();
            wsRef.current = null;
        };
    }, []);

    return { unreadCount, items, isLoading, hasMore, loadNotifications, loadMore, markRead, markAllRead };
}
