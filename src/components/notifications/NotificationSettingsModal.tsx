"use client";

import { Alert, Center, Loader, Modal, Stack, Switch, Tabs, Text } from "@mantine/core";
import type { RoleEnum } from "@/client/types.gen";
import { useAuth } from "@/contexts/AuthContext";
import { useEmailSubscription } from "./hooks/useEmailSubscription";
import { useInAppSubscription } from "./hooks/useInAppSubscription";
import { useNotificationSchedules } from "./hooks/useNotificationSchedules";
import { usePushSubscription } from "./hooks/usePushSubscription";
import { ScheduleCard } from "./ScheduleCard";

interface NotificationSettingsModalProps {
    opened: boolean;
    onClose: () => void;
    patientId: number | null;
    patientName?: string;
    viewerRole: RoleEnum;
}

interface ChannelSwitchesProps {
    showPush: boolean;
    pushState: ReturnType<typeof usePushSubscription>["state"];
    pushError: string | null;
    subscribe: () => Promise<void>;
    unsubscribe: () => Promise<void>;
    emailState: ReturnType<typeof useEmailSubscription>["state"];
    emailError: string | null;
    enableEmail: () => Promise<void>;
    disableEmail: () => Promise<void>;
    inAppState: ReturnType<typeof useInAppSubscription>["state"];
    inAppError: string | null;
    enableInApp: () => Promise<void>;
    disableInApp: () => Promise<void>;
}

function ChannelSwitches({
    showPush,
    pushState,
    pushError,
    subscribe,
    unsubscribe,
    emailState,
    emailError,
    enableEmail,
    disableEmail,
    inAppState,
    inAppError,
    enableInApp,
    disableInApp,
}: ChannelSwitchesProps) {
    return (
        <Stack gap="xs">
            {showPush && (
                <>
                    <Switch
                        label="Push-уведомления"
                        checked={pushState === "subscribed"}
                        disabled={pushState === "loading" || pushState === "unsupported" || pushState === "denied"}
                        onChange={e => void (e.currentTarget.checked ? subscribe() : unsubscribe())}
                    />
                    {pushState === "unsupported" && (
                        <Text
                            size="xs"
                            c="dimmed">
                            Ваш браузер не поддерживает push-уведомления.
                        </Text>
                    )}
                    {pushState === "denied" && (
                        <Text
                            size="xs"
                            c="red">
                            Уведомления заблокированы. Разрешите их в настройках браузера.
                        </Text>
                    )}
                    {pushError && (
                        <Text
                            size="xs"
                            c="red">
                            {pushError}
                        </Text>
                    )}
                </>
            )}
            <Switch
                label="Email-уведомления"
                checked={emailState === "enabled"}
                disabled={emailState === "loading"}
                onChange={e => void (e.currentTarget.checked ? enableEmail() : disableEmail())}
            />
            {emailError && (
                <Text
                    size="xs"
                    c="red">
                    {emailError}
                </Text>
            )}
            <Switch
                label="Уведомления в приложении"
                checked={inAppState === "enabled"}
                disabled={inAppState === "loading"}
                onChange={e => void (e.currentTarget.checked ? enableInApp() : disableInApp())}
            />
            {inAppError && (
                <Text
                    size="xs"
                    c="red">
                    {inAppError}
                </Text>
            )}
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
    const { state: pushState, error: pushError, subscribe, unsubscribe } = usePushSubscription();
    // Два экземпляра хука: email пациента и email текущего пользователя
    const patientEmail = useEmailSubscription(opened ? patientId : null);
    const myEmail = useEmailSubscription(opened ? viewerUserId : null);
    // Два экземпляра хука: in-app пациента и in-app текущего пользователя
    const patientInApp = useInAppSubscription(opened ? patientId : null);
    const myInApp = useInAppSubscription(opened ? viewerUserId : null);

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
        <Modal
            opened={opened}
            onClose={onClose}
            title={modalTitle}
            centered
            size="md">
            <Stack gap="md">
                {patientId === null && (
                    <Text
                        size="sm"
                        c="dimmed"
                        ta="center">
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
                            <Tabs
                                defaultValue="patient"
                                keepMounted>
                                <Tabs.List>
                                    <Tabs.Tab value="patient">Уведомления пациента</Tabs.Tab>
                                    <Tabs.Tab value="mine">Мои уведомления</Tabs.Tab>
                                </Tabs.List>

                                <Tabs.Panel
                                    value="patient"
                                    pt="md">
                                    <Stack gap="md">
                                        <ChannelSwitches
                                            showPush={false}
                                            pushState={pushState}
                                            pushError={pushError}
                                            subscribe={subscribe}
                                            unsubscribe={unsubscribe}
                                            emailState={patientEmail.state}
                                            emailError={patientEmail.error}
                                            enableEmail={patientEmail.enable}
                                            disableEmail={patientEmail.disable}
                                            inAppState={patientInApp.state}
                                            inAppError={patientInApp.error}
                                            enableInApp={patientInApp.enable}
                                            disableInApp={patientInApp.disable}
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

                                <Tabs.Panel
                                    value="mine"
                                    pt="md">
                                    <Stack gap="md">
                                        <ChannelSwitches
                                            showPush={true}
                                            pushState={pushState}
                                            pushError={pushError}
                                            subscribe={subscribe}
                                            unsubscribe={unsubscribe}
                                            emailState={myEmail.state}
                                            emailError={myEmail.error}
                                            enableEmail={myEmail.enable}
                                            disableEmail={myEmail.disable}
                                            inAppState={myInApp.state}
                                            inAppError={myInApp.error}
                                            enableInApp={myInApp.enable}
                                            disableInApp={myInApp.disable}
                                        />
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
                                <ChannelSwitches
                                    showPush={viewerRole === "patient"}
                                    pushState={pushState}
                                    pushError={pushError}
                                    subscribe={subscribe}
                                    unsubscribe={unsubscribe}
                                    emailState={
                                        viewerRole === "patient" ? myEmail.state : patientEmail.state
                                    }
                                    emailError={
                                        viewerRole === "patient" ? myEmail.error : patientEmail.error
                                    }
                                    enableEmail={
                                        viewerRole === "patient" ? myEmail.enable : patientEmail.enable
                                    }
                                    disableEmail={
                                        viewerRole === "patient" ? myEmail.disable : patientEmail.disable
                                    }
                                    inAppState={
                                        viewerRole === "patient" ? myInApp.state : patientInApp.state
                                    }
                                    inAppError={
                                        viewerRole === "patient" ? myInApp.error : patientInApp.error
                                    }
                                    enableInApp={
                                        viewerRole === "patient" ? myInApp.enable : patientInApp.enable
                                    }
                                    disableInApp={
                                        viewerRole === "patient" ? myInApp.disable : patientInApp.disable
                                    }
                                />
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