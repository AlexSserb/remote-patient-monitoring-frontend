"use client";

import { useCallback, useEffect, useState } from "react";
import { Box, Button, Container, Group, Stack, Text, Title } from "@mantine/core";
import type { InAppNotification } from "@/components/notifications/hooks/useInAppNotifications";

interface NotificationsPage {
    results: InAppNotification[];
    count: number;
    unreadCount: number;
    hasMore: boolean;
}

function formatTime(isoString: string): string {
    return new Date(isoString).toLocaleString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function NotificationsPage() {
    const [items, setItems] = useState<InAppNotification[]>([]);
    const [hasMore, setHasMore] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [offset, setOffset] = useState(0);

    const load = useCallback((currentOffset: number, append: boolean) => {
        setIsLoading(true);
        fetch(`/api/notifications/in-app/?limit=20&offset=${currentOffset.toString()}`)
            .then(res => (res.ok ? (res.json() as Promise<NotificationsPage>) : Promise.reject(res.status)))
            .then(page => {
                setItems(prev => (append ? [...prev, ...page.results] : page.results));
                setHasMore(page.hasMore);
                setOffset(currentOffset + 20);
            })
            .catch(() => {})
            .finally(() => setIsLoading(false));
    }, []);

    useEffect(() => {
        load(0, false);
    }, [load]);

    function markRead(id: number) {
        setItems(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)));
        fetch(`/api/notifications/in-app/${id.toString()}/read/`, { method: "PATCH" }).catch(() => {});
    }

    function markAllRead() {
        setItems(prev => prev.map(n => ({ ...n, isRead: true })));
        fetch("/api/notifications/in-app/read-all/", { method: "POST" }).catch(() => {});
    }

    const hasUnread = items.some(n => !n.isRead);

    return (
        <Container
            size="sm"
            py="xl">
            <Group
                justify="space-between"
                mb="md">
                <Title order={2}>Уведомления</Title>
                {hasUnread && (
                    <Button
                        variant="default"
                        size="sm"
                        onClick={markAllRead}>
                        Прочитать все
                    </Button>
                )}
            </Group>

            {isLoading && items.length === 0 ? (
                <Text
                    ta="center"
                    c="dimmed"
                    py="xl">
                    Загрузка…
                </Text>
            ) : items.length === 0 ? (
                <Text
                    ta="center"
                    c="dimmed"
                    py="xl">
                    Уведомлений нет
                </Text>
            ) : (
                <Stack gap="sm">
                    {items.map(n => (
                        <Box
                            key={n.id}
                            px="md"
                            py="sm"
                            bg={n.isRead ? undefined : "var(--mantine-color-blue-light)"}
                            style={{
                                cursor: n.isRead ? "default" : "pointer",
                                borderBottom: "1px solid var(--mantine-color-default-border)",
                                borderRadius: 8,
                            }}
                            onClick={() => {
                                if (!n.isRead) markRead(n.id);
                            }}>
                            <Text
                                size="sm"
                                fw={n.isRead ? 400 : 600}>
                                {n.title}
                            </Text>
                            <Text
                                size="sm"
                                c="dimmed">
                                {n.body}
                            </Text>
                            <Text
                                size="xs"
                                c="dimmed"
                                mt={4}>
                                {formatTime(n.sentAt)}
                            </Text>
                        </Box>
                    ))}

                    {hasMore && (
                        <Button
                            variant="subtle"
                            fullWidth
                            mt="sm"
                            loading={isLoading}
                            onClick={() => load(offset, true)}>
                            Загрузить ещё
                        </Button>
                    )}
                </Stack>
            )}
        </Container>
    );
}
