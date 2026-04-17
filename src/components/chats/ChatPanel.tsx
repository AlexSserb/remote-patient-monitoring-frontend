"use client";

import { useEffect, useRef, useState } from "react";
import {
    ActionIcon,
    Alert,
    Box,
    Button,
    Center,
    Divider,
    Group,
    Loader,
    Paper,
    ScrollArea,
    Text,
    Textarea,
} from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import type { Message } from "@/client/types.gen";
import { useChatMessages } from "./hooks/useChatMessages";

export interface SelectedChat {
    chatId: number;
    name: string;
    roleLabel: string;
    patientName?: string;
}

interface ChatPanelProps {
    chat: SelectedChat | null;
    isMobile: boolean;
    onBack: () => void;
}

function formatTime(isoString: string): string {
    return new Intl.DateTimeFormat("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(isoString));
}

interface MessageBubbleProps {
    message: Message;
    currentUserId: number | null;
}

function MessageBubble({ message, currentUserId }: MessageBubbleProps) {
    const isOwn = message.sender.id === currentUserId;
    return (
        <Box
            style={{
                display: "flex",
                justifyContent: isOwn ? "flex-end" : "flex-start",
                marginBottom: 8,
            }}>
            <Box style={{ maxWidth: "70%" }}>
                {!isOwn && (
                    <Text
                        size="xs"
                        c="dimmed"
                        mb={2}>
                        {message.sender.first_name} {message.sender.last_name}
                    </Text>
                )}
                <Paper
                    px="sm"
                    py={6}
                    radius="md"
                    bg={isOwn ? "blue.6" : "gray.1"}>
                    <Text
                        size="sm"
                        c={isOwn ? "white" : "dark"}>
                        {message.content}
                    </Text>
                    <Text
                        size="xs"
                        c={isOwn ? "blue.1" : "dimmed"}
                        ta="right"
                        mt={2}>
                        {formatTime(message.created_at)}
                    </Text>
                </Paper>
            </Box>
        </Box>
    );
}

interface MessageListProps {
    chatId: number;
    currentUserId: number | null;
}

function MessageList({ chatId, currentUserId }: MessageListProps) {
    const { messages, isLoading, isLoadingMore, hasMore, error, sendError, loadMore, sendMessage } =
        useChatMessages(chatId);

    const [inputValue, setInputValue] = useState("");
    const viewportRef = useRef<HTMLDivElement>(null);
    const prevMessageCountRef = useRef(0);

    // Auto-scroll to bottom when new messages arrive at the end
    useEffect(() => {
        const viewport = viewportRef.current;
        if (!viewport) return;

        const prevCount = prevMessageCountRef.current;
        prevMessageCountRef.current = messages.length;

        if (messages.length === 0) return;

        // Only auto-scroll when messages were added at the bottom (new incoming/sent), not when loading older ones
        const addedAtBottom = messages.length > prevCount && prevCount > 0;
        const initialLoad = prevCount === 0;

        if (initialLoad || addedAtBottom) {
            viewport.scrollTo({ top: viewport.scrollHeight, behavior: initialLoad ? "instant" : "smooth" });
        }
    }, [messages]);

    function handleSend() {
        const trimmed = inputValue.trim();
        if (!trimmed) return;
        sendMessage(trimmed);
        setInputValue("");
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }

    if (isLoading) {
        return (
            <Center style={{ flex: 1 }}>
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

    return (
        <>
            <ScrollArea
                style={{ flex: 1 }}
                viewportRef={viewportRef}
                px="md"
                pt="sm">
                {hasMore && (
                    <Center mb="sm">
                        <Button
                            variant="subtle"
                            size="xs"
                            loading={isLoadingMore}
                            onClick={loadMore}>
                            Загрузить старые сообщения
                        </Button>
                    </Center>
                )}
                {messages.length === 0 && (
                    <Center h={100}>
                        <Text c="dimmed">Нет сообщений</Text>
                    </Center>
                )}
                {messages.map(msg => (
                    <MessageBubble
                        key={msg.id}
                        message={msg}
                        currentUserId={currentUserId}
                    />
                ))}
            </ScrollArea>

            <Divider />

            {sendError && (
                <Alert
                    color="red"
                    py="xs"
                    px="md">
                    {sendError}
                </Alert>
            )}

            <Group
                p="sm"
                gap="xs"
                align="flex-end">
                <Textarea
                    style={{ flex: 1 }}
                    placeholder="Введите сообщение…"
                    autosize
                    minRows={1}
                    maxRows={5}
                    value={inputValue}
                    onChange={e => setInputValue(e.currentTarget.value)}
                    onKeyDown={handleKeyDown}
                />
                <ActionIcon
                    size="lg"
                    variant="filled"
                    color="blue"
                    disabled={!inputValue.trim()}
                    onClick={handleSend}
                    aria-label="Отправить">
                    ➤
                </ActionIcon>
            </Group>
        </>
    );
}

export function ChatPanel({ chat, isMobile, onBack }: ChatPanelProps) {
    // Fetch current user id to mark own messages — session endpoint already exists
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);

    useEffect(() => {
        fetch("/api/auth/session")
            .then(res => (res.ok ? res.json() : Promise.reject()))
            .then((data: { userId: number }) => setCurrentUserId(data.userId))
            .catch(() => {});
    }, []);

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
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
            <Divider />
            <Group
                px="md"
                py="sm"
                style={{ borderBottom: "1px solid var(--mantine-color-gray-2)", flexShrink: 0 }}>
                {isMobile && (
                    <Button
                        variant="outline"
                        size="sm"
                        leftSection={<IconArrowLeft size={16} />}
                        onClick={onBack}>
                        Назад
                    </Button>
                )}
                <div>
                    <Text fw={600}>{chat.name}</Text>
                    <Text
                        size="xs"
                        c="dimmed">
                        {chat.roleLabel}
                    </Text>
                    {chat.patientName && (
                        <Text
                            size="xs"
                            c="dimmed">
                            Пациент: {chat.patientName}
                        </Text>
                    )}
                </div>
            </Group>

            <MessageList
                chatId={chat.chatId}
                currentUserId={currentUserId}
            />
        </div>
    );
}
