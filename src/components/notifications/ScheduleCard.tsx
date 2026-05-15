"use client";

import { useEffect, useState } from "react";
import { ActionIcon, Badge, Button, Checkbox, Group, Paper, Stack, Switch, Text, TextInput } from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import type { NotificationSchedule } from "@/client/types.gen";
import { useSaveSchedule } from "./hooks/useSaveSchedule";

const DAY_LABELS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

const ROLE_LABELS: Record<string, string> = {
    doctor: "Врач",
    patient: "Пациент",
    caregiver: "Опекун",
};

interface ScheduleCardProps {
    schedule: NotificationSchedule | null;
    patientId: number;
    recipientId?: number;
    recipientName: string;
    recipientRole: string;
    isOwnCard: boolean;
    canEdit: boolean;
    onSaved: () => void;
    onDirtyChange?: (isDirty: boolean) => void;
}

export function ScheduleCard({
    schedule,
    patientId,
    recipientId,
    recipientName,
    recipientRole,
    isOwnCard,
    canEdit,
    onSaved,
    onDirtyChange,
}: ScheduleCardProps) {
    const { save, isLoading, error } = useSaveSchedule();

    const [daysOfWeek, setDaysOfWeek] = useState<string[]>((schedule?.daysOfWeek ?? []).map(String));
    const [times, setTimes] = useState<string[]>(schedule?.times ?? []);
    const [isEnabled, setIsEnabled] = useState(schedule?.isEnabled ?? true);

    // Синхронизируем локальное состояние при обновлении данных с сервера после сохранения
    useEffect(() => {
        setDaysOfWeek((schedule?.daysOfWeek ?? []).map(String));
        setTimes(schedule?.times ?? []);
        setIsEnabled(schedule?.isEnabled ?? true);
    }, [schedule?.id, schedule?.updatedAt]);

    const initialDaysOfWeek = (schedule?.daysOfWeek ?? []).map(String);
    const initialTimes = schedule?.times ?? [];
    const initialIsEnabled = schedule?.isEnabled ?? true;

    const isDirty =
        JSON.stringify([...daysOfWeek].sort()) !== JSON.stringify([...initialDaysOfWeek].sort()) ||
        JSON.stringify(times) !== JSON.stringify(initialTimes) ||
        isEnabled !== initialIsEnabled;

    useEffect(() => {
        onDirtyChange?.(isDirty);
    }, [isDirty, onDirtyChange]);

    function handleAddTime() {
        setTimes(prev => [...prev, "09:00"]);
    }

    function handleRemoveTime(index: number) {
        setTimes(prev => prev.filter((_, i) => i !== index));
    }

    function handleTimeChange(index: number, value: string) {
        setTimes(prev => prev.map((t, i) => (i === index ? value : t)));
    }

    function handleSave() {
        save({
            id: schedule?.id,
            patientId,
            recipientId,
            daysOfWeek: daysOfWeek.map(Number),
            times,
            isEnabled,
        }).then(saved => {
            if (saved) onSaved();
        });
    }

    const roleBadgeColor = recipientRole === "patient" ? "blue" : "grape";

    return (
        <Paper
            withBorder
            p="md"
            radius="sm"
            style={isOwnCard ? { borderColor: "var(--mantine-color-blue-4)" } : undefined}>
            <Stack gap="sm">
                <Group
                    justify="space-between"
                    align="center">
                    <Group gap="xs">
                        <Text
                            fw={500}
                            size="sm">
                            {recipientName}
                        </Text>
                        <Badge
                            size="xs"
                            variant="light"
                            color={roleBadgeColor}>
                            {ROLE_LABELS[recipientRole] ?? recipientRole}
                        </Badge>
                        {isOwnCard && (
                            <Badge
                                size="xs"
                                variant="dot"
                                color="blue">
                                Моё
                            </Badge>
                        )}
                    </Group>
                    {canEdit && (
                        <Switch
                            size="sm"
                            label="Включено"
                            checked={isEnabled}
                            onChange={e => setIsEnabled(e.currentTarget.checked)}
                        />
                    )}
                </Group>

                <Checkbox.Group
                    label="Дни недели"
                    value={daysOfWeek}
                    onChange={canEdit ? setDaysOfWeek : undefined}>
                    <Group
                        gap="xs"
                        mt={4}>
                        {DAY_LABELS.map((label, i) => (
                            <Checkbox
                                key={i}
                                value={String(i)}
                                label={label}
                                disabled={!canEdit}
                            />
                        ))}
                    </Group>
                </Checkbox.Group>

                <Stack gap={4}>
                    <Text
                        size="sm"
                        fw={500}>
                        Время отправки
                    </Text>
                    {times.map((time, i) => (
                        <Group
                            key={i}
                            gap="xs">
                            <TextInput
                                style={{ flex: 1 }}
                                value={time}
                                onChange={e => handleTimeChange(i, e.currentTarget.value)}
                                placeholder="09:00"
                                pattern="^([01]\d|2[0-3]):[0-5]\d$"
                                disabled={!canEdit}
                                size="xs"
                            />
                            {canEdit && (
                                <ActionIcon
                                    variant="subtle"
                                    color="red"
                                    size="sm"
                                    onClick={() => handleRemoveTime(i)}
                                    aria-label="Удалить время">
                                    <IconTrash size={14} />
                                </ActionIcon>
                            )}
                        </Group>
                    ))}
                    {canEdit && (
                        <Button
                            variant="subtle"
                            size="xs"
                            leftSection={<IconPlus size={14} />}
                            onClick={handleAddTime}
                            style={{ alignSelf: "flex-start" }}>
                            Добавить время
                        </Button>
                    )}
                    {times.length === 0 && (
                        <Text
                            size="xs"
                            c="dimmed">
                            Нет запланированного времени
                        </Text>
                    )}
                </Stack>

                {canEdit && (
                    <>
                        {error && (
                            <Text
                                size="xs"
                                c="red">
                                {error}
                            </Text>
                        )}
                        <Button
                            size="xs"
                            loading={isLoading}
                            disabled={!isDirty && schedule !== null}
                            onClick={handleSave}
                            style={{ alignSelf: "flex-end" }}>
                            Сохранить
                        </Button>
                    </>
                )}
            </Stack>
        </Paper>
    );
}
