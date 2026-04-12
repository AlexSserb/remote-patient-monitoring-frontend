"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Box, Divider, NavLink, Stack } from "@mantine/core";
import { useNavItems } from "@/hooks/useNavItems";
import type { UserRole } from "@/lib/navigation";

interface MobileNavbarProps {
    role: UserRole | undefined;
    onClose: () => void;
}

export function MobileNavbar({ role, onClose }: MobileNavbarProps) {
    const pathname = usePathname();
    const navItems = useNavItems(role);

    return (
        <Box style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <Stack gap={0} pt="sm" style={{ flex: 1 }}>
                {navItems.map((item) => (
                    <NavLink
                        key={item.href}
                        component={Link}
                        href={item.href}
                        label={item.label}
                        leftSection={<item.icon size={20} />}
                        active={pathname === item.href}
                        onClick={onClose}
                    />
                ))}
            </Stack>
            <Divider />
            <NavLink
                component={Link}
                href="/profile"
                label="Профиль"
                active={pathname === "/profile"}
                onClick={onClose}
            />
        </Box>
    );
}