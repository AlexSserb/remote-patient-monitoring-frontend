"use client";

import { useEffect, useState } from "react";
import { Alert, Avatar, Button, Center, Divider, Group, Loader, Stack, Text, UnstyledButton } from "@mantine/core";
import type { ChatGroupMember, DoctorChatGroup } from "@/client/types.gen";
import type { SelectedChat } from "./ChatPanel";

// Label for non-patient members depends on whose groups we're viewing:
// a doctor sees caregivers; a caregiver sees doctors
const OTHER_MEMBER_LABEL: Record<"doctor" | "caregiver", string> = {
    doctor: "Опекун/Родственник",
    caregiver: "Врач",
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
            .map(m => m.last_message_at)
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
                    {getInitials(member.first_name, member.last_name)}
                </Avatar>
                <div>
                    <Text fw={500}>
                        {member.first_name} {member.last_name}
                    </Text>
                    <Text
                        size="xs"
                        c="dimmed">
                        {roleLabel}
                    </Text>
                    {member.last_message_at && (
                        <Text
                            size="xs"
                            c="dimmed">
                            {formatDate(member.last_message_at)}
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
    const otherMemberLabel = OTHER_MEMBER_LABEL[currentUserRole];
    const [groups, setGroups] = useState<DoctorChatGroup[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<DoctorChatGroup | null>(null);
    const [isLoading, setIsLoading] = useState(true); // true on mount — effect fires immediately
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/chats/groups")
            .then(res => (res.ok ? res.json() : Promise.reject(res.status)))
            .then((data: DoctorChatGroup[]) => setGroups(data))
            .catch(() => setError("Не удалось загрузить чаты. Попробуйте позже."))
            .finally(() => setIsLoading(false));
    }, []);

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
        const { patient, caregivers } = selectedGroup;
        const patientName = `${patient.first_name} ${patient.last_name}`;
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
                        onClick={() => setSelectedGroup(null)}>
                        ← Назад
                    </Button>
                    <Text fw={600}>Группа: {patientName}</Text>
                </Group>
                <Stack gap={0}>
                    <Divider />
                    <MemberRow
                        member={patient}
                        roleLabel="Пациент"
                        onClick={() => onSelectChat({ name: patientName, roleLabel: "Пациент" })}
                    />
                    {caregivers.map(member => (
                        <MemberRow
                            key={member.id}
                            member={member}
                            roleLabel={otherMemberLabel}
                            onClick={() =>
                                onSelectChat({
                                    name: `${member.first_name} ${member.last_name}`,
                                    roleLabel: otherMemberLabel,
                                })
                            }
                        />
                    ))}
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
                const patientName = `${patient.first_name} ${patient.last_name}`;
                const last = latestMessage([patient, ...caregivers]);
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
                                {getInitials(patient.first_name, patient.last_name)}
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
