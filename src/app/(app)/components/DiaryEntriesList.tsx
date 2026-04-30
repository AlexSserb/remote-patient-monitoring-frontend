"use client";

import { useState } from "react";
import { ActionIcon, Alert, Box, Button, Center, Group, Loader, Modal, Stack, Text, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPencil, IconPencilOff, IconTrash } from "@tabler/icons-react";
import type { DiaryEntryInfo } from "@/client/types.gen";

const DATE_FORMAT = new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
});

interface DiaryEntriesListProps {
    entries: DiaryEntryInfo[];
    isLoading: boolean;
    error: string | null;
    selectedEntryId: number | null;
    onSelect: (entry: DiaryEntryInfo) => void;
    onDelete: (entryId: number) => void;
}

function formatValue(
    type: DiaryEntryInfo["values"][number]["metricType"],
    valueNumber: number | null | undefined,
    valueText: string | undefined,
    valueBoolean: boolean | null | undefined
): string {
    if (type === "number") return valueNumber != null ? String(valueNumber) : "—";
    if (type === "boolean") return valueBoolean == null ? "—" : valueBoolean ? "Да" : "Нет";
    return valueText || "—";
}

export function DiaryEntriesList({
    entries,
    isLoading,
    error,
    selectedEntryId,
    onSelect,
    onDelete,
}: DiaryEntriesListProps) {
    const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
    const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);

    const isEditing = selectedEntryId !== null;

    function handleDeleteClick(e: React.MouseEvent, entryId: number) {
        e.stopPropagation();
        setPendingDeleteId(entryId);
        openModal();
    }

    function handleConfirmDelete() {
        if (pendingDeleteId !== null) onDelete(pendingDeleteId);
        closeModal();
        setPendingDeleteId(null);
    }

    return (
        <>
            <Modal
                opened={modalOpened}
                onClose={closeModal}
                title="Удаление записи"
                centered>
                <Text mb="md">Вы уверены, что хотите удалить данную запись?</Text>
                <Group justify="flex-end">
                    <Button
                        variant="subtle"
                        onClick={closeModal}>
                        Отмена
                    </Button>
                    <Button
                        color="red"
                        onClick={handleConfirmDelete}>
                        Удалить
                    </Button>
                </Group>
            </Modal>

            <Stack gap="xs">
                <Title order={4}>Записи дневника</Title>

                {error && <Alert color="red">{error}</Alert>}

                {isLoading ? (
                    <Center h={200}>
                        <Loader />
                    </Center>
                ) : entries.length === 0 ? (
                    <Center h={200}>
                        <Text c="dimmed">Записей пока нет</Text>
                    </Center>
                ) : (
                    <Stack gap="xs">
                        {entries.map(entry => {
                            const isSelected = entry.id === selectedEntryId;
                            return (
                                <Box
                                    key={entry.id}
                                    p="sm"
                                    style={theme => ({
                                        border: `${isSelected ? "2px" : "1px"} solid ${isSelected ? theme.colors.blue[5] : theme.colors.gray[3]}`,
                                        borderRadius: theme.radius.md,
                                    })}>
                                    <Group
                                        justify="space-between"
                                        mb={4}>
                                        <Text
                                            size="sm"
                                            fw={600}>
                                            {DATE_FORMAT.format(new Date(entry.createdAt))}
                                        </Text>
                                        <Group gap={4}>
                                            <ActionIcon
                                                variant="subtle"
                                                color={isSelected ? "blue" : "gray"}
                                                disabled={isEditing}
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    onSelect(entry);
                                                }}>
                                                {isSelected ? <IconPencilOff /> : <IconPencil />}
                                            </ActionIcon>
                                            <ActionIcon
                                                variant="subtle"
                                                color="red"
                                                onClick={e => handleDeleteClick(e, entry.id)}>
                                                <IconTrash />
                                            </ActionIcon>
                                        </Group>
                                    </Group>

                                    <Stack gap={2}>
                                        {entry.values.map(v => (
                                            <Text
                                                key={v.metricCode}
                                                size="xs"
                                                c="dimmed">
                                                {v.metricName}
                                                {v.metricUnit ? ` (${v.metricUnit})` : ""}:{" "}
                                                {formatValue(v.metricType, v.valueNumber, v.valueText, v.valueBoolean)}
                                            </Text>
                                        ))}
                                    </Stack>
                                </Box>
                            );
                        })}
                    </Stack>
                )}
            </Stack>
        </>
    );
}
