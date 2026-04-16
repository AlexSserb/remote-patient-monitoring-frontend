"use client";

import { Button, Center, Divider, Group, Text } from "@mantine/core";

export interface SelectedChat {
    name: string;
    roleLabel: string;
}

interface ChatPanelProps {
    chat: SelectedChat | null;
    isMobile: boolean;
    onBack: () => void;
}

export function ChatPanel({ chat, isMobile, onBack }: ChatPanelProps) {
    if (!chat) {
        return (
            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                <Divider />
                <Center style={{ flex: 1 }}>
                    <Text c="dimmed">Выберите чат</Text>
                </Center>
            </div>
        );
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <Divider />
            <Group
                px="md"
                py="sm"
                style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }}>
                {isMobile && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onBack}>
                        ← Назад
                    </Button>
                )}
                <div>
                    <Text fw={600}>{chat.name}</Text>
                    <Text
                        size="xs"
                        c="dimmed">
                        {chat.roleLabel}
                    </Text>
                </div>
            </Group>
        </div>
    );
}
