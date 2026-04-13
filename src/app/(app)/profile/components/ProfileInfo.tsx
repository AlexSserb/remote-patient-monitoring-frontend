"use client";

import { useState } from "react";
import { Avatar, Badge, Button, Card, Container, Divider, Group, Stack, Text, Title } from "@mantine/core";
import type { RoleEnum, UserProfile } from "@/client/types.gen";
import { useAuth } from "@/contexts/AuthContext";

const ROLE_LABELS: Record<RoleEnum, string> = {
    doctor: "Врач",
    patient: "Пациент",
    caregiver: "Опекун/Родственник",
};

interface ProfileInfoProps {
    profile: UserProfile;
}

export function ProfileInfo({ profile }: ProfileInfoProps) {
    const { logout } = useAuth();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    async function handleLogout() {
        setIsLoggingOut(true);
        await logout();
    }

    const initials = [profile.first_name[0], profile.last_name[0]]
        .filter(Boolean)
        .join("")
        .toUpperCase();

    const fullName = `${profile.first_name} ${profile.last_name}`.trim();

    const dateJoined = new Intl.DateTimeFormat("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(new Date(profile.date_joined));

    return (
        <Container size="xs" py="xl">
            <Card shadow="sm" padding="xl" radius="md" withBorder>
                <Stack align="center" gap="xs" mb="lg">
                    <Avatar size="xl" radius="xl" color="blue">
                        {initials}
                    </Avatar>
                    <Title order={3}>{fullName}</Title>
                </Stack>

                <Divider mb="md" />

                <Stack gap="sm">
                    <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                            Email
                        </Text>
                        <Text size="sm">{profile.email}</Text>
                    </Group>
                    <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                            Роль
                        </Text>
                        <Badge variant="light">{ROLE_LABELS[profile.role]}</Badge>
                    </Group>
                    <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                            Дата регистрации
                        </Text>
                        <Text size="sm">{dateJoined}</Text>
                    </Group>
                </Stack>

                <Divider mt="md" mb="md" />

                <Button
                    variant="subtle"
                    color="red"
                    fullWidth
                    loading={isLoggingOut}
                    onClick={handleLogout}
                >
                    Выйти
                </Button>
            </Card>
        </Container>
    );
}