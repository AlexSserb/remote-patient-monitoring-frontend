"use client";

import type React from "react";
import { ActionIcon, Badge, Box, Button, Group, Indicator, Popover, ScrollArea, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconBell } from "@tabler/icons-react";
import type { UseInAppNotificationsReturn } from "./hooks/useInAppNotifications";

interface NotificationBellProps {
    notifications: UseInAppNotificationsReturn;
}

function formatTime(isoString: string): string {
    return new Date(isoString).toLocaleString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function NotificationBell({ notifications: notif }: NotificationBellProps) {
    const [opened, { open, close }] = useDisclosure(false);

    function handleToggle() {
        if (opened) {
            close();
        } else {
            notif.loadNotifications();
            open();
        }
    }

    function handleMarkAllRead() {
        notif.markAllRead();
        fetch("/api/notifications/in-app/read-all/", { method: "POST" }).catch(() => {});
    }

    function handleMarkRead(id: number) {
        notif.markRead(id);
        fetch(`/api/notifications/in-app/${id.toString()}/read/`, { method: "PATCH" }).catch(() => {});
    }

    return (
        <Popover
            opened={opened}
            onChange={val => (val ? open() : close())}
            closeOnClickOutside
            width={340}
            position="bottom-end"
            shadow="md">
            <Popover.Target>
                <Indicator
                    disabled={notif.unreadCount === 0}
                    label={notif.unreadCount > 99 ? "99+" : notif.unreadCount}
                    size={18}
                    color="red"
                    processing={notif.unreadCount > 0}>
                    <ActionIcon
                        variant="default"
                        size="lg"
                        aria-label="Уведомления"
                        onClick={handleToggle}>
                        <IconBell size={20} />
                    </ActionIcon>
                </Indicator>
            </Popover.Target>

            <Popover.Dropdown p={0}>
                <Group
                    px="md"
                    py="sm"
                    justify="space-between"
                    style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}>
                    <Text fw={600}>Уведомления</Text>
                    {notif.items.some(n => !n.isRead) && (
                        <Button
                            variant="subtle"
                            size="xs"
                            onClick={handleMarkAllRead}>
                            Прочитать все
                        </Button>
                    )}
                </Group>

                <ScrollArea h={400}>
                    {notif.isLoading && notif.items.length === 0 ? (
                        <Text
                            ta="center"
                            py="xl"
                            c="dimmed"
                            size="sm">
                            Загрузка…
                        </Text>
                    ) : notif.items.length === 0 ? (
                        <Text
                            ta="center"
                            py="xl"
                            c="dimmed"
                            size="sm">
                            Уведомлений нет
                        </Text>
                    ) : (
                        <Stack gap={0}>
                            {notif.items.map(n => (
                                <Box
                                    key={n.id}
                                    px="md"
                                    py="sm"
                                    bg={n.isRead ? undefined : "var(--mantine-color-blue-light)"}
                                    style={{
                                        cursor: n.isRead ? "default" : "pointer",
                                        borderBottom: "1px solid var(--mantine-color-default-border)",
                                    }}
                                    onClick={() => {
                                        if (!n.isRead) handleMarkRead(n.id);
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

                            {notif.hasMore && (
                                <Button
                                    variant="subtle"
                                    fullWidth
                                    size="sm"
                                    loading={notif.isLoading}
                                    onClick={notif.loadMore}
                                    my="xs">
                                    Загрузить ещё
                                </Button>
                            )}
                        </Stack>
                    )}
                </ScrollArea>
            </Popover.Dropdown>
        </Popover>
    );
}