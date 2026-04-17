"use client";

import { useState } from "react";
import { Drawer, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import type { UserRole } from "@/lib/navigation";
import { PatientChatList } from "./PatientChatList";
import { GroupedChatList } from "./GroupedChatList";
import { ChatPanel, type SelectedChat } from "./ChatPanel";

interface ChatDrawerProps {
    opened: boolean;
    onClose: () => void;
    role?: UserRole;
}

export function ChatDrawer({ opened, onClose, role }: ChatDrawerProps) {
    const isMobile = useMediaQuery("(max-width: 768px)") ?? false;
    const [selectedChat, setSelectedChat] = useState<SelectedChat | null>(null);

    function handleClose() {
        setSelectedChat(null);
        onClose();
    }

    const sidebar =
        role === "patient" ? (
            <PatientChatList onSelectChat={setSelectedChat} />
        ) : role === "doctor" || role === "caregiver" ? (
            <GroupedChatList
                currentUserRole={role}
                onSelectChat={setSelectedChat}
            />
        ) : null;

    return (
        <Drawer
            opened={opened}
            onClose={handleClose}
            // Title must be plain text or non-heading element — Drawer wraps it in <h2>
            title={
                <Text
                    fw={600}
                    size="lg">
                    Чаты
                </Text>
            }
            position="right"
            size={isMobile ? "100%" : "70%"}
            styles={{
                content: { display: "flex", flexDirection: "column" },
                body: { padding: 0, flex: 1, minHeight: 0, display: "flex", flexDirection: "column" },
            }}>
            {isMobile ? (
                selectedChat ? (
                    <ChatPanel
                        chat={selectedChat}
                        isMobile
                        onBack={() => setSelectedChat(null)}
                    />
                ) : (
                    <div style={{ flex: 1, overflowY: "auto" }}>{sidebar}</div>
                )
            ) : (
                <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
                    {/* Left sidebar */}
                    <div
                        style={{
                            width: 360,
                            flexShrink: 0,
                            overflowY: "auto",
                            borderRight: "1px solid var(--mantine-color-gray-2)",
                        }}>
                        {sidebar}
                    </div>
                    {/* Right chat panel */}
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto" }}>
                        <ChatPanel
                            chat={selectedChat}
                            isMobile={false}
                            onBack={() => setSelectedChat(null)}
                        />
                    </div>
                </div>
            )}
        </Drawer>
    );
}
