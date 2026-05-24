"use client";

import { Alert, Center, Loader, Modal, Stack, Tabs, Text } from "@mantine/core";
import type { RoleEnum } from "@/client/types.gen";
import { useAuth } from "@/contexts/AuthContext";
import { useNotificationSchedules } from "./hooks/useNotificationSchedules";
import { ScheduleCard } from "./ScheduleCard";
import { EmailSwitch } from "./switches/EmailSwitch";
import { InAppSwitch } from "./switches/InAppSwitch";
import { PushSwitch } from "./switches/PushSwitch";
import { VkSwitch } from "./switches/VkSwitch";

interface NotificationSettingsModalProps {
    opened: boolean;
    onClose: () => void;
    patientId: number | null;
    patientName?: string;
    viewerRole: RoleEnum;
}

interface ChannelSwitchesProps {
    userId: number;
    showPush: boolean;
    isOwn: boolean;
    targetName: string | null;
}

function ChannelSwitches({ userId, showPush, isOwn, targetName }: ChannelSwitchesProps) {
    return (
        <Stack gap="xs">
            {showPush && <PushSwitch />}
            <EmailSwitch userId={userId} />
            <InAppSwitch userId={userId} />
            <VkSwitch userId={userId} isOwn={isOwn} targetName={targetName} />
        </Stack>
    );
}

export function NotificationSettingsModal({
    opened,
    onClose,
    patientId,
    patientName,
    viewerRole,
}: NotificationSettingsModalProps) {
    const { user } = useAuth();
    const viewerUserId = user?.userId ?? null;

    // Передаём null когда модалка закрыта, чтобы не делать запрос
    const { schedules, isLoading, error, refetch } = useNotificationSchedules(opened ? patientId : null);

    const patientSchedule = schedules.find(s => s.recipient.role === "patient") ?? null;
    const mySchedule = schedules.find(s => s.recipient.id === viewerUserId) ?? null;

    const modalTitle = patientName ? `Уведомления: ${patientName}` : "Настройки уведомлений";
    // Опекун видит оба таба; врач и пациент — только одну форму
    const showTabs = viewerRole === "caregiver" && patientId !== null;

    const patientCardName = patientSchedule
        ? `${patientSchedule.recipient.firstName} ${patientSchedule.recipient.lastName}`
        : (patientName ?? "Пациент");

    const myCardName = mySchedule
        ? `${mySchedule.recipient.firstName} ${mySchedule.recipient.lastName}`
        : "Моё расписание";

    return (
        <Modal opened={opened} onClose={onClose} title={modalTitle} centered size="md">
            <Stack gap="md">
                {patientId === null && (
                    <Text size="sm" c="dimmed" ta="center">
                        Выберите пациента, чтобы увидеть настройки
                    </Text>
                )}

                {patientId !== null && isLoading && (
                    <Center py="md">
                        <Loader size="sm" />
                    </Center>
                )}

                {patientId !== null && error && <Alert color="red">{error}</Alert>}

                {patientId !== null && !isLoading && !error && (
                    <>
                        {showTabs ? (
                            // keepMounted держит оба таба в DOM, сохраняя состояние форм при переключении
                            <Tabs defaultValue="patient" keepMounted>
                                <Tabs.List>
                                    <Tabs.Tab value="patient">Уведомления пациента</Tabs.Tab>
                                    <Tabs.Tab value="mine">Мои уведомления</Tabs.Tab>
                                </Tabs.List>

                                <Tabs.Panel value="patient" pt="md">
                                    <Stack gap="md">
                                        <ChannelSwitches
                                            userId={patientId}
                                            showPush={false}
                                            isOwn={false}
                                            targetName={patientName ?? null}
                                        />
                                        <ScheduleCard
                                            schedule={patientSchedule}
                                            patientId={patientId}
                                            recipientId={patientId}
                                            recipientName={patientCardName}
                                            recipientRole="patient"
                                            isOwnCard={false}
                                            canEdit={true}
                                            onSaved={refetch}
                                        />
                                    </Stack>
                                </Tabs.Panel>

                                <Tabs.Panel value="mine" pt="md">
                                    <Stack gap="md">
                                        {viewerUserId !== null && (
                                            <ChannelSwitches
                                                userId={viewerUserId}
                                                showPush={true}
                                                isOwn={true}
                                                targetName={null}
                                            />
                                        )}
                                        <ScheduleCard
                                            schedule={mySchedule}
                                            patientId={patientId}
                                            recipientName={myCardName}
                                            recipientRole="caregiver"
                                            isOwnCard={true}
                                            canEdit={true}
                                            onSaved={refetch}
                                        />
                                    </Stack>
                                </Tabs.Panel>
                            </Tabs>
                        ) : (
                            <Stack gap="md">
                                {viewerRole === "patient" && viewerUserId !== null ? (
                                    <ChannelSwitches
                                        userId={viewerUserId}
                                        showPush={true}
                                        isOwn={true}
                                        targetName={null}
                                    />
                                ) : (
                                    <ChannelSwitches
                                        userId={patientId}
                                        showPush={false}
                                        isOwn={false}
                                        targetName={patientName ?? null}
                                    />
                                )}
                                <ScheduleCard
                                    schedule={patientSchedule}
                                    patientId={patientId}
                                    recipientId={viewerRole === "doctor" ? patientId : undefined}
                                    recipientName={
                                        viewerRole === "doctor"
                                            ? patientCardName
                                            : (patientSchedule
                                                  ? `${patientSchedule.recipient.firstName} ${patientSchedule.recipient.lastName}`
                                                  : "Моё расписание")
                                    }
                                    recipientRole="patient"
                                    isOwnCard={viewerRole === "patient"}
                                    canEdit={true}
                                    onSaved={refetch}
                                />
                            </Stack>
                        )}
                    </>
                )}
            </Stack>
        </Modal>
    );
}
