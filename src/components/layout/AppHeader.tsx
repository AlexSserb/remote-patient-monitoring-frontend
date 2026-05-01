"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Anchor, Burger, Group, Text } from "@mantine/core";
import { useNavItems } from "@/hooks/useNavItems";
import type { UserRole } from "@/lib/navigation";

interface AppHeaderProps {
    opened: boolean;
    onToggle: () => void;
    onChatOpen: () => void;
    role?: UserRole;
}

export function AppHeader({ opened, onToggle, onChatOpen, role }: AppHeaderProps) {
    const pathname = usePathname();
    const navItems = useNavItems(role);

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
                {navItems.map(item => (
                    <Anchor
                        key={item.href}
                        component={Link}
                        href={item.href}
                        fw={pathname === item.href ? 600 : 400}>
                        {item.label}
                    </Anchor>
                ))}
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
