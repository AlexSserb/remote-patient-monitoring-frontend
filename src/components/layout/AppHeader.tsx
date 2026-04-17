"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Anchor, Burger, Group, Text } from "@mantine/core";

interface AppHeaderProps {
    opened: boolean;
    onToggle: () => void;
    onChatOpen: () => void;
}

export function AppHeader({ opened, onToggle, onChatOpen }: AppHeaderProps) {
    const pathname = usePathname();

    return (
        <Group
            h="100%"
            px="md"
            justify="space-between">
            <Text
                component={Link}
                href="/"
                fw={700}
                size="lg"
                style={{ textDecoration: "none" }}>
                EndoMonitoring
            </Text>
            <Burger
                opened={opened}
                onClick={onToggle}
                hiddenFrom="sm"
                size="sm"
            />
            <Group
                visibleFrom="sm"
                gap="md">
                <Anchor
                    component="button"
                    onClick={onChatOpen}>
                    Чаты
                </Anchor>
                <Anchor
                    component={Link}
                    href="/profile"
                    fw={pathname === "/profile" ? 600 : 400}>
                    Профиль
                </Anchor>
            </Group>
        </Group>
    );
}
