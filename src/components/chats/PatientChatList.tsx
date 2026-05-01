"use client";

import { useEffect, useState } from "react";
import { Alert, Avatar, Center, Divider, Group, Loader, Stack, Text, UnstyledButton } from "@mantine/core";
import type { ChatItem } from "@/client/types.gen";
import type { SelectedChat } from "./ChatPanel";

interface Interlocutor {
    first_name: string;
    last_name: string;
    role?: string;
}

const ROLE_LABELS: Record<string, string> = {
    doctor: "Врач",
    caregiver: "Опекун/Родственник",
    patient: "Пациент",
};

function getInitials(firstName: string, lastName: string): string {
    return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
}

function formatDate(isoString: string): string {
    return new Intl.DateTimeFormat("ru-RU", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(isoString));
}

interface PatientChatListProps {
    onSelectChat: (chat: SelectedChat) => void;
}

export function PatientChatList({ onSelectChat }: PatientChatListProps) {
    const [chats, setChats] = useState<ChatItem[]>([]);
    const [isLoading, setIsLoading] = useState(true); // true on mount — effect fires immediately
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/chats")
            .then(res => (res.ok ? res.json() : Promise.reject(res.status)))
            .then((data: ChatItem[]) => setChats(data))
            .catch(() => setError("Не удалось загрузить чаты. Попробуйте позже."))
            .finally(() => setIsLoading(false));
    }, []);

    if (isLoading) {
        return (
            <Center h={200}>
                <Loader />
            </Center>
        );
    }

    if (error) {
        return (
            <Alert
                color="red"
                m="md">
                {error}
            </Alert>
        );
    }

    if (chats.length === 0) {
        return (
            <Center h={200}>
                <Text c="dimmed">Нет доступных чатов</Text>
            </Center>
        );
    }

    return (
        <Stack gap={0}>
            <Divider />
            {chats.map(chat => {
                const person = chat.interlocutor as unknown as Interlocutor;
                const name = `${person.first_name} ${person.last_name}`;
                const roleLabel = ROLE_LABELS[person.role ?? ""] ?? person.role ?? "";
                return (
                    <UnstyledButton
                        key={chat.id}
                        px="md"
                        py="sm"
                        style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }}
                        onClick={() => onSelectChat({ chatId: chat.id, name, roleLabel })}>
                        <Group>
                            <Avatar
                                radius="xl"
                                color="blue">
                                {getInitials(person.first_name, person.last_name)}
                            </Avatar>
                            <div>
                                <Text fw={500}>{name}</Text>
                                {person.role && (
                                    <Text
                                        size="xs"
                                        c="dimmed">
                                        {roleLabel}
                                    </Text>
                                )}
                                {chat.lastMessageAt && (
                                    <Text
                                        size="xs"
                                        c="dimmed">
                                        {formatDate(chat.lastMessageAt)}
                                    </Text>
                                )}
                            </div>
                        </Group>
                    </UnstyledButton>
                );
            })}
        </Stack>
    );
}
