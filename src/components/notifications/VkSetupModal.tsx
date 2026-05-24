"use client";

import { useEffect, useRef, useState } from "react";
import { ActionIcon, Anchor, CopyButton, Group, Loader, Modal, Stack, Text, Tooltip } from "@mantine/core";
import { IconCheck, IconCopy } from "@tabler/icons-react";
import type { VkState } from "./hooks/useVkSubscription";

const VK_COMMUNITY_URL = "https://vk.com/club238997578";
const POLL_INTERVAL_MS = 3000;

interface VkSetupModalProps {
    opened: boolean;
    onClose: () => void;
    targetName: string | null;
    isOwnAccount: boolean;
    onLinked: () => void;
    generateToken: () => Promise<{ token: string; expiresIn: number } | null>;
    vkState: VkState;
}

export function VkSetupModal({
    opened,
    onClose,
    targetName,
    isOwnAccount,
    onLinked,
    generateToken,
    vkState,
}: VkSetupModalProps) {
    const [token, setToken] = useState<string | null>(null);
    const [tokenError, setTokenError] = useState<string | null>(null);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (!opened) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setToken(null);
            setTokenError(null);
            return;
        }

        void generateToken().then(result => {
            if (result) {
                setToken(result.token);
            } else {
                setTokenError("Не удалось сгенерировать код. Попробуйте закрыть и открыть заново.");
            }
        });
    }, [opened, generateToken]);

    // Поллинг статуса каждые 3 секунды пока модалка открыта и VK не привязан
    useEffect(() => {
        if (!opened || vkState === "enabled") return;

        pollRef.current = setInterval(() => {
            onLinked();
        }, POLL_INTERVAL_MS);

        return () => {
            if (pollRef.current !== null) clearInterval(pollRef.current);
        };
    }, [opened, vkState, onLinked]);

    // Закрываем модалку автомати��ески когда VK успешно привязан
    useEffect(() => {
        if (vkState === "enabled" && opened) {
            if (pollRef.current !== null) clearInterval(pollRef.current);
            onClose();
        }
    }, [vkState, opened, onClose]);

    const command = token ? `/connect ${token}` : null;

    const instructionText = isOwnAccount
        ? "Напишите следующую команду нашему VK-сообществу:"
        : `Передайте следующую команду пользователю ${targetName ?? ""}, чтобы он отправил её нашему VK-сообществу:`;

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title="Подключение VK-уведомлений"
            centered
            size="sm"
            zIndex={300}>
            <Stack gap="md">
                <Text size="sm">{instructionText}</Text>

                {tokenError && (
                    <Text size="sm" c="red">
                        {tokenError}
                    </Text>
                )}

                {!token && !tokenError && <Loader size="sm" />}

                {token && (
                    <Group gap="xs" align="center">
                        <Text size="sm" ff="monospace" fw={600}>
                            {command}
                        </Text>
                        <CopyButton value={command ?? ""} timeout={2000}>
                            {({ copied, copy }) => (
                                <Tooltip label={copied ? "Скопировано" : "Копировать"}>
                                    <ActionIcon size="sm" variant="subtle" onClick={copy}>
                                        {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                                    </ActionIcon>
                                </Tooltip>
                            )}
                        </CopyButton>
                    </Group>
                )}

                <Text size="sm">
                    Сообщество VK:{" "}
                    <Anchor href={VK_COMMUNITY_URL} target="_blank" rel="noopener noreferrer">
                        {VK_COMMUNITY_URL}
                    </Anchor>
                </Text>

                {token && (
                    <Group gap="xs">
                        <Loader size="xs" />
                        <Text size="xs" c="dimmed">
                            Ожидаем подключения…
                        </Text>
                    </Group>
                )}
            </Stack>
        </Modal>
    );
}
