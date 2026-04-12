"use client";

import { AppShell } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { AppHeader } from "./AppHeader";
import { MobileNavbar } from "./MobileNavbar";
import type { UserRole } from "@/lib/navigation";

interface AppShellLayoutProps {
    children: React.ReactNode;
    // Resolved from the user session after login; drives which nav items are shown
    role?: UserRole;
}

export function AppShellLayout({ children, role }: AppShellLayoutProps) {
    const [opened, { toggle, close }] = useDisclosure();

    return (
        <AppShell
            header={{ height: 60 }}
            navbar={{
                width: 280,
                breakpoint: "sm",
                // Navbar is drawer-style on mobile only; always hidden on desktop
                collapsed: { desktop: true, mobile: !opened },
            }}
        >
            <AppShell.Header>
                <AppHeader opened={opened} onToggle={toggle} />
            </AppShell.Header>

            <AppShell.Navbar>
                <MobileNavbar role={role} onClose={close} />
            </AppShell.Navbar>

            <AppShell.Main>{children}</AppShell.Main>
        </AppShell>
    );
}