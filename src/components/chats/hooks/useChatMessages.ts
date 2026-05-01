"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Message, MessagePage } from "@/client/types.gen";

interface WsIncomingMessage {
    type: "chat.message";
    message: Message;
}

interface WsDeletedMessage {
    type: "chat.message_deleted";
    message_id: number;
}

interface WsEditedMessage {
    type: "chat.message_edited";
    message_id: number;
    content: string;
}

interface WsErrorMessage {
    type: "error";
    code: string;
    detail: string;
}

type WsMessage = WsIncomingMessage | WsDeletedMessage | WsEditedMessage | WsErrorMessage;

export interface UseChatMessagesReturn {
    messages: Message[];
    isLoading: boolean;
    isLoadingMore: boolean;
    hasMore: boolean;
    error: string | null;
    sendError: string | null;
    loadMore: () => void;
    sendMessage: (content: string) => void;
    deleteMessage: (messageId: number) => void;
    editMessage: (messageId: number, content: string) => void;
}

function buildWsUrl(chatId: number, token: string): string {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";
    const wsBase = apiUrl.replace(/^http/, "ws");
    return `${wsBase}/ws/chats/${chatId}/?token=${token}`;
}

export function useChatMessages(chatId: number | null): UseChatMessagesReturn {
    // Tracks which chatId we have finished loading. Differs from chatId while fetching.
    const [loadedForChatId, setLoadedForChatId] = useState<number | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sendError, setSendError] = useState<string | null>(null);

    // Derived: true while chatId is set but the initial page hasn't returned yet.
    // Old error/messages are irrelevant while this is true (UI shows a spinner).
    const isLoading = chatId !== null && loadedForChatId !== chatId;

    const oldestIdRef = useRef<number | null>(null);
    const wsRef = useRef<WebSocket | null>(null);

    const loadMore = useCallback(() => {
        if (!chatId || isLoadingMore || !hasMore || oldestIdRef.current === null) return;

        setIsLoadingMore(true);
        const beforeId = oldestIdRef.current;

        fetch(`/api/chats/${chatId}/messages/?before_id=${beforeId}`)
            .then(res => (res.ok ? (res.json() as Promise<MessagePage>) : Promise.reject(res.status)))
            .then(page => {
                const older = [...page.results].reverse();
                setMessages(prev => [...older, ...prev]);
                setHasMore(page.hasMore);
                if (older.length > 0) oldestIdRef.current = older[0].id;
            })
            .catch(() => setError("Не удалось загрузить сообщения. Попробуйте позже."))
            .finally(() => setIsLoadingMore(false));
    }, [chatId, isLoadingMore, hasMore]);

    const sendMessage = useCallback((content: string) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
            setSendError("Соединение потеряно. Перезагрузите страницу.");
            return;
        }
        setSendError(null);
        wsRef.current.send(JSON.stringify({ content }));
    }, []);

    const deleteMessage = useCallback((messageId: number) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
            setSendError("Соединение потеряно. Перезагрузите страницу.");
            return;
        }
        wsRef.current.send(JSON.stringify({ type: "delete", message_id: messageId }));
    }, []);

    const editMessage = useCallback((messageId: number, content: string) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
            setSendError("Соединение потеряно. Перезагрузите страницу.");
            return;
        }
        wsRef.current.send(JSON.stringify({ type: "edit", message_id: messageId, content }));
    }, []);

    useEffect(() => {
        if (!chatId) return;

        let cancelled = false;
        let ws: WebSocket | null = null;

        // All setState calls happen inside async callbacks — no synchronous setState in effect body
        fetch(`/api/chats/${chatId}/messages/`)
            .then(res => (res.ok ? (res.json() as Promise<MessagePage>) : Promise.reject(res.status)))
            .then(page => {
                if (cancelled) return;
                const ordered = [...page.results].reverse();
                setMessages(ordered);
                setHasMore(page.hasMore);
                setError(null);
                setSendError(null);
                oldestIdRef.current = ordered[0]?.id ?? null;
                setLoadedForChatId(chatId);
            })
            .catch(() => {
                if (cancelled) return;
                setMessages([]);
                setHasMore(false);
                setError("Не удалось загрузить сообщения. Попробуйте позже.");
                setLoadedForChatId(chatId);
            });

        fetch("/api/auth/ws-token")
            .then(res => (res.ok ? (res.json() as Promise<{ token: string }>) : Promise.reject(res.status)))
            .then(({ token }) => {
                if (cancelled) return;
                ws = new WebSocket(buildWsUrl(chatId, token));
                wsRef.current = ws;

                ws.onmessage = event => {
                    try {
                        const data = JSON.parse(event.data as string) as WsMessage;
                        if (data.type === "chat.message") {
                            setMessages(prev => [...prev, data.message]);
                        } else if (data.type === "chat.message_deleted") {
                            setMessages(prev =>
                                prev.map(m =>
                                    m.id === data.message_id ? { ...m, is_deleted: true, content: null } : m
                                )
                            );
                        } else if (data.type === "chat.message_edited") {
                            setMessages(prev =>
                                prev.map(m =>
                                    m.id === data.message_id ? { ...m, content: data.content, edited: true } : m
                                )
                            );
                        }
                    } catch {
                        // Malformed frame — ignore
                    }
                };

                ws.onerror = () => setSendError("Ошибка соединения с чатом.");
            })
            .catch(() => {
                if (!cancelled) setSendError("Не удалось подключиться к чату.");
            });

        return () => {
            cancelled = true;
            ws?.close();
            wsRef.current = null;
        };
    }, [chatId]);

    return {
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
    };
}
