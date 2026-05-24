"use client";

import { useEffect, useState } from "react";
import { Alert, Avatar, Button, Center, Divider, Group, Loader, Stack, Text, UnstyledButton } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import type { CaregiverChatGroup, ChatGroupMember, DoctorChatGroup } from "@/client/types.gen";
import type { SelectedChat } from "./ChatPanel";

type ChatGroup = DoctorChatGroup | CaregiverChatGroup;

const DOCTOR_LABEL = "Врач";
const CAREGIVER_LABEL = "Опекун/Родственник";

const GROUP_API_URL: Record<"doctor" | "caregiver", string> = {
    doctor: "/api/chats/doctor-groups",
    caregiver: "/api/chats/caregiver-groups",
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

// Picks the most recent last_message_at from a list of members
function latestMessage(members: ChatGroupMember[]): string | null {
    return (
        members
            .map(m => m.lastMessageAt)
            .filter((d): d is string => Boolean(d))
            .sort()
            .at(-1) ?? null
    );
}

interface MemberRowProps {
    member: ChatGroupMember;
    roleLabel: string;
    onClick: () => void;
}

function MemberRow({ member, roleLabel, onClick }: MemberRowProps) {
    return (
        <UnstyledButton
            px="md"
            py="sm"
            style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }}
            onClick={onClick}>
            <Group>
                <Avatar
                    radius="xl"
                    color="blue">
                    {getInitials(member.firstName, member.lastName)}
                </Avatar>
                <div>
                    <Text fw={500}>
                        {member.firstName} {member.lastName}
                    </Text>
                    <Text
                        size="xs"
                        c="dimmed">
                        {roleLabel}
                    </Text>
                    {member.lastMessageAt && (
                        <Text
                            size="xs"
                            c="dimmed">
                            {formatDate(member.lastMessageAt)}
                        </Text>
                    )}
                </div>
            </Group>
        </UnstyledButton>
    );
}

interface GroupedChatListProps {
    currentUserRole: "doctor" | "caregiver";
    onSelectChat: (chat: SelectedChat) => void;
}

export function GroupedChatList({ currentUserRole, onSelectChat }: GroupedChatListProps) {
    const [groups, setGroups] = useState<ChatGroup[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<ChatGroup | null>(null);
    const [isLoading, setIsLoading] = useState(true); // true on mount — effect fires immediately
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch(GROUP_API_URL[currentUserRole])
            .then(res => (res.ok ? res.json() : Promise.reject(res.status)))
            .then((data: ChatGroup[]) => setGroups(data))
            .catch(() => setError("Не удалось загрузить чаты. Попробуйте позже."))
            .finally(() => setIsLoading(false));
    }, [currentUserRole]);

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

    // Expanded group: show patient + all other members individually
    if (selectedGroup) {
        const { patient } = selectedGroup;
        const patientName = `${patient.firstName} ${patient.lastName}`;
        const doctors = currentUserRole === "caregiver" ? (selectedGroup as CaregiverChatGroup).doctors : [];
        const { caregivers } = selectedGroup;

        function renderMemberRow(member: ChatGroupMember, roleLabel: string) {
            return (
                <MemberRow
                    key={member.id}
                    member={member}
                    roleLabel={roleLabel}
                    onClick={() =>
                        member.chatId !== null &&
                        onSelectChat({
                            chatId: member.chatId,
                            name: `${member.firstName} ${member.lastName}`,
                            roleLabel,
                            patientName,
                        })
                    }
                />
            );
        }

        return (
            <>
                <Divider />
                <Group
                    px="md"
                    py="sm"
                    style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }}>
                    <Button
                        variant="outline"
                        size="sm"
                        leftSection={<IconArrowLeft size={16} />}
                        onClick={() => setSelectedGroup(null)}>
                        Назад
                    </Button>
                    <Text fw={600}>Группа: {patientName}</Text>
                </Group>
                <Stack gap={0}>
                    <Divider />
                    <MemberRow
                        member={patient}
                        roleLabel="Пациент"
                        onClick={() =>
                            patient.chatId !== null &&
                            onSelectChat({ chatId: patient.chatId, name: patientName, roleLabel: "Пациент" })
                        }
                    />
                    {doctors.map(member => renderMemberRow(member, DOCTOR_LABEL))}
                    {caregivers.map(member => renderMemberRow(member, CAREGIVER_LABEL))}
                </Stack>
            </>
        );
    }

    if (groups.length === 0) {
        return (
            <Center h={200}>
                <Text c="dimmed">Нет доступных чатов</Text>
            </Center>
        );
    }

    // Groups list: one row per patient group
    return (
        <Stack gap={0}>
            <Divider />
            {groups.map(group => {
                const { patient, caregivers } = group;
                const doctors = currentUserRole === "caregiver" ? (group as CaregiverChatGroup).doctors : [];
                const patientName = `${patient.firstName} ${patient.lastName}`;
                const last = latestMessage([patient, ...doctors, ...caregivers]);
                return (
                    <UnstyledButton
                        key={patient.id}
                        px="md"
                        py="sm"
                        style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }}
                        onClick={() => setSelectedGroup(group)}>
                        <Group>
                            <Avatar
                                radius="xl"
                                color="teal">
                                {getInitials(patient.firstName, patient.lastName)}
                            </Avatar>
                            <div>
                                <Text fw={500}>Группа: {patientName}</Text>
                                {last && (
                                    <Text
                                        size="xs"
                                        c="dimmed">
                                        {formatDate(last)}
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
