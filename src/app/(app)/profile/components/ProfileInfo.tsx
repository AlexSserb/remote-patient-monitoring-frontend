"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, Badge, Button, Card, Container, Divider, Group, Stack, Text, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import type { RoleEnum, UserProfile } from "@/client/types.gen";
import { useAuth } from "@/contexts/AuthContext";
import { EditNameModal } from "./EditNameModal";
import { EmailChangeModal } from "./EmailChangeModal";
import { PasswordResetModal } from "./PasswordResetModal";

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
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [editNameOpened, { open: openEditName, close: closeEditName }] = useDisclosure(false);
    const [emailChangeOpened, { open: openEmailChange, close: closeEmailChange }] = useDisclosure(false);
    const [passwordResetOpened, { open: openPasswordReset, close: closePasswordReset }] = useDisclosure(false);

    function handleLogout() {
        setIsLoggingOut(true);
        logout();
    }

    function handleUpdateSuccess() {
        // Re-run the server component to reflect saved changes
        router.refresh();
    }

    const initials = [profile.firstName[0], profile.lastName[0]].filter(Boolean).join("").toUpperCase();

    const fullName = `${profile.firstName} ${profile.lastName}`.trim();

    const dateJoined = new Intl.DateTimeFormat("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(new Date(profile.dateJoined));

    return (
        <>
            <Container
                size="xs"
                py="xl">
                <Card
                    shadow="sm"
                    padding="xl"
                    radius="md"
                    withBorder>
                    <Stack
                        align="center"
                        gap="xs"
                        mb="lg">
                        <Avatar
                            size="xl"
                            radius="xl"
                            color="blue">
                            {initials}
                        </Avatar>
                        <Title order={3}>{fullName}</Title>
                    </Stack>

                    <Divider mb="md" />

                    <Stack gap="sm">
                        <Group justify="space-between">
                            <Text
                                size="sm"
                                c="dimmed">
                                Email
                            </Text>
                            <Text size="sm">{profile.email}</Text>
                        </Group>
                        <Group justify="space-between">
                            <Text
                                size="sm"
                                c="dimmed">
                                Роль
                            </Text>
                            <Badge variant="light">{ROLE_LABELS[profile.role]}</Badge>
                        </Group>
                        <Group justify="space-between">
                            <Text
                                size="sm"
                                c="dimmed">
                                Дата регистрации
                            </Text>
                            <Text size="sm">{dateJoined}</Text>
                        </Group>
                    </Stack>

                    <Divider
                        mt="md"
                        mb="md"
                    />

                    <Stack gap="xs">
                        <Button
                            variant="light"
                            fullWidth
                            onClick={openEditName}>
                            Редактировать
                        </Button>
                        <Button
                            variant="light"
                            fullWidth
                            onClick={openEmailChange}>
                            Изменить почту
                        </Button>
                        <Button
                            variant="light"
                            fullWidth
                            onClick={openPasswordReset}>
                            Сменить пароль
                        </Button>
                        <Button
                            variant="outline"
                            color="red"
                            fullWidth
                            loading={isLoggingOut}
                            onClick={handleLogout}>
                            Выйти
                        </Button>
                    </Stack>
                </Card>
            </Container>

            <EditNameModal
                opened={editNameOpened}
                firstName={profile.firstName}
                lastName={profile.lastName}
                onClose={closeEditName}
                onSuccess={handleUpdateSuccess}
            />

            <EmailChangeModal
                opened={emailChangeOpened}
                onClose={closeEmailChange}
                onSuccess={handleUpdateSuccess}
            />

            <PasswordResetModal
                opened={passwordResetOpened}
                onClose={closePasswordReset}
            />
        </>
    );
}
