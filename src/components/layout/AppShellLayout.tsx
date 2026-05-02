"use client";

import { AppShell } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { AppHeader } from "./AppHeader";
import { MobileNavbar } from "./MobileNavbar";
import { ChatDrawer } from "@/components/chats/ChatDrawer";
import type { UserRole } from "@/lib/navigation";

interface AppShellLayoutProps {
    children: React.ReactNode;
    role?: UserRole;
}

export function AppShellLayout({ children, role }: AppShellLayoutProps) {
    const [navOpened, { toggle: toggleNav, close: closeNav }] = useDisclosure();
    const [chatOpened, { open: openChat, close: closeChat }] = useDisclosure();

    return (
        <>
            <AppShell
                header={{ height: 60 }}
                navbar={{
                    width: 280,
                    breakpoint: "sm",
                    collapsed: { desktop: true, mobile: !navOpened },
                }}>
                <AppShell.Header>
                    <AppHeader
                        opened={navOpened}
                        onToggle={toggleNav}
                        onChatOpen={openChat}
                        role={role}
                    />
                </AppShell.Header>

                <AppShell.Navbar>
                    <MobileNavbar
                        role={role}
                        onClose={closeNav}
                        onChatOpen={openChat}
                    />
                </AppShell.Navbar>

                <AppShell.Main>{children}</AppShell.Main>
            </AppShell>

            <ChatDrawer
                opened={chatOpened}
                onClose={closeChat}
                role={role}
            />
        </>
    );
}
