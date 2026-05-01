"use client";

import { Fragment, useEffect, useRef, useState } from "react";
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
    Portal,
    ScrollArea,
    Text,
    Textarea,
    UnstyledButton,
} from "@mantine/core";
import { IconArrowLeft, IconPencil, IconX } from "@tabler/icons-react";
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

function formatDateSeparator(isoString: string): string {
    return new Intl.DateTimeFormat("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(new Date(isoString));
}

function isSameDay(a: string, b: string): boolean {
    const da = new Date(a);
    const db = new Date(b);
    return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate();
}

function DateSeparator({ isoString }: { isoString: string }) {
    return (
        <Center my="xs">
            <Text
                size="xs"
                c="dimmed"
                px="sm"
                py={2}
                style={{
                    background: "var(--mantine-color-gray-3)",
                    borderRadius: "var(--mantine-radius-xl)",
                }}>
                {formatDateSeparator(isoString)}
            </Text>
        </Center>
    );
}

interface MessageBubbleProps {
    message: Message;
    currentUserId: number | null;
    onShowMenu: (messageId: number, x: number, y: number) => void;
}

function MessageBubble({ message, currentUserId, onShowMenu }: MessageBubbleProps) {
    const isOwn = message.sender.id === currentUserId;
    const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    function handleContextMenu(e: React.MouseEvent) {
        if (!isOwn || message.isDeleted) return;
        e.preventDefault();
        onShowMenu(message.id, e.clientX, e.clientY);
    }

    function handleTouchStart(e: React.TouchEvent) {
        if (!isOwn || message.isDeleted) return;
        if (e.touches.length === 2) {
            e.preventDefault();
            onShowMenu(message.id, e.touches[0].clientX, e.touches[0].clientY);
            return;
        }
        const { clientX, clientY } = e.touches[0];
        longPressTimer.current = setTimeout(() => onShowMenu(message.id, clientX, clientY), 500);
    }

    function cancelLongPress() {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    }

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
                        {message.sender.firstName} {message.sender.lastName}
                    </Text>
                )}
                <Paper
                    px="sm"
                    py={6}
                    radius="md"
                    bg={isOwn ? "blue.6" : "gray.1"}
                    onContextMenu={handleContextMenu}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={cancelLongPress}
                    onTouchMove={cancelLongPress}
                    style={{ userSelect: "none" }}>
                    {message.isDeleted ? (
                        <Text
                            size="sm"
                            c={isOwn ? "blue.2" : "dimmed"}
                            fs="italic">
                            Сообщение удалено
                        </Text>
                    ) : (
                        <Text
                            size="sm"
                            c={isOwn ? "white" : "dark"}>
                            {message.content}
                        </Text>
                    )}
                    <Text
                        size="xs"
                        c={isOwn ? "blue.1" : "dimmed"}
                        ta="right"
                        mt={2}>
                        {message.edited && !message.isDeleted && "(ред.) "}
                        {formatTime(message.createdAt)}
                    </Text>
                </Paper>
            </Box>
        </Box>
    );
}

interface ContextMenuState {
    messageId: number;
    x: number;
    y: number;
}

interface EditingMessage {
    id: number;
    content: string;
}

interface MessageListProps {
    chatId: number;
    currentUserId: number | null;
}

function MessageList({ chatId, currentUserId }: MessageListProps) {
    const {
        messages,
        isLoading,
        isLoadingMore,
        hasMore,
        error,
        sendError,
        loadMore,
        sendMessage,
        deleteMessage,
        editMessage,
    } = useChatMessages(chatId);

    const [inputValue, setInputValue] = useState("");
    const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
    const [editingMessage, setEditingMessage] = useState<EditingMessage | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const viewportRef = useRef<HTMLDivElement>(null);

    function handleShowMenu(messageId: number, x: number, y: number) {
        setContextMenu({ messageId, x, y });
    }

    function handleDeleteFromMenu() {
        if (contextMenu) deleteMessage(contextMenu.messageId);
        setContextMenu(null);
    }

    function handleEditFromMenu() {
        if (!contextMenu) return;
        const msg = messages.find(m => m.id === contextMenu.messageId);
        if (msg?.content) {
            setEditingMessage({ id: msg.id, content: msg.content });
            setInputValue(msg.content);
            setTimeout(() => textareaRef.current?.focus(), 0);
        }
        setContextMenu(null);
    }

    function cancelEditing() {
        setEditingMessage(null);
        setInputValue("");
    }
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
        if (editingMessage) {
            editMessage(editingMessage.id, trimmed);
            setEditingMessage(null);
        } else {
            sendMessage(trimmed);
        }
        setInputValue("");
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === "Escape") {
            cancelEditing();
            return;
        }
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
                {messages.map((msg, i) => {
                    const showDate = i === 0 || !isSameDay(messages[i - 1].createdAt, msg.createdAt);
                    return (
                        <Fragment key={msg.id}>
                            {showDate && <DateSeparator isoString={msg.createdAt} />}
                            <MessageBubble
                                message={msg}
                                currentUserId={currentUserId}
                                onShowMenu={handleShowMenu}
                            />
                        </Fragment>
                    );
                })}
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

            {editingMessage && (
                <Group
                    px="md"
                    py="xs"
                    gap="xs"
                    style={{
                        borderTop: "1px solid var(--mantine-color-gray-2)",
                        background: "var(--mantine-color-blue-0)",
                    }}>
                    <IconPencil
                        size={14}
                        color="var(--mantine-color-blue-6)"
                    />
                    <Text
                        size="xs"
                        c="blue.7"
                        style={{ flex: 1 }}
                        truncate>
                        {editingMessage.content.length > 60
                            ? editingMessage.content.slice(0, 60) + "…"
                            : editingMessage.content}
                    </Text>
                    <ActionIcon
                        variant="subtle"
                        size="xs"
                        color="gray"
                        onClick={cancelEditing}
                        aria-label="Отменить редактирование">
                        <IconX size={12} />
                    </ActionIcon>
                </Group>
            )}

            <Group
                p="sm"
                gap="xs"
                align="flex-end">
                <Textarea
                    ref={textareaRef}
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
            {contextMenu && (
                <Portal>
                    <div
                        style={{ position: "fixed", inset: 0, zIndex: 999 }}
                        onClick={() => setContextMenu(null)}
                    />
                    <Paper
                        shadow="md"
                        withBorder
                        style={{
                            position: "fixed",
                            top: contextMenu.y,
                            left: contextMenu.x,
                            transform: "translateX(-100%)",
                            zIndex: 1000,
                            minWidth: 150,
                            overflow: "hidden",
                        }}>
                        <UnstyledButton
                            w="100%"
                            px="md"
                            py="xs"
                            onClick={handleEditFromMenu}>
                            <Text size="sm">Редактировать</Text>
                        </UnstyledButton>
                        <Divider />
                        <UnstyledButton
                            w="100%"
                            px="md"
                            py="xs"
                            onClick={handleDeleteFromMenu}>
                            <Text
                                size="sm"
                                c="red">
                                Удалить
                            </Text>
                        </UnstyledButton>
                    </Paper>
                </Portal>
            )}
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
