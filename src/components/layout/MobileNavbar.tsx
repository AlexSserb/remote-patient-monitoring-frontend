"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";
import {Box, NavLink, Stack} from "@mantine/core";
import {useNavItems} from "@/hooks/useNavItems";
import type {UserRole} from "@/lib/navigation";
import {IconBrandLine, IconUserCircle} from "@tabler/icons-react";

interface MobileNavbarProps {
    role: UserRole | undefined;
    onClose: () => void;
    onChatOpen: () => void;
}

export function MobileNavbar({role, onClose, onChatOpen}: MobileNavbarProps) {
    const pathname = usePathname();
    const navItems = useNavItems(role);

    function handleChatOpen() {
        onClose();
        onChatOpen();
    }

    return (
        <Box style={{display: "flex", flexDirection: "column", height: "100%"}}>
            <Stack
                gap={0}
                pt="sm"
                style={{flex: 1}}>
                <NavLink
                    label="Чаты"
                    onClick={handleChatOpen}
                    leftSection={<IconBrandLine/>}
                />
                <NavLink
                    component={Link}
                    href="/profile"
                    label="Профиль"
                    active={pathname === "/profile"}
                    onClick={onClose}
                    leftSection={<IconUserCircle/>}
                />
                {navItems.map(item => (
                    <NavLink
                        key={item.href}
                        component={Link}
                        href={item.href}
                        label={item.label}
                        leftSection={<item.icon size={20}/>}
                        active={pathname === item.href}
                        onClick={onClose}
                    />
                ))}
            </Stack>
        </Box>
    );
}
