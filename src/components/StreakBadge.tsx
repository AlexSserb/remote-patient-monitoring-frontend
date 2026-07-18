"use client";

import {Group, Text, Tooltip} from "@mantine/core";
import {IconFlame} from "@tabler/icons-react";
import type {PatientStreak} from "@/client/types.gen";

interface StreakBadgeProps {
    streak: PatientStreak | null | undefined;
    size?: "sm" | "md";
}

function isTodayLocal(dateStr: string | null | undefined): boolean {
    if (!dateStr) return false;
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    return dateStr === todayStr;
}

export function StreakBadge({streak, size = "md"}: StreakBadgeProps) {
    const current = streak?.currentStreak ?? 0;
    const isActive = isTodayLocal(streak?.lastEntryDate);
    const iconSize = size === "sm" ? 16 : 20;
    const textSize = size === "sm" ? "sm" : "md";

    return (
        <Tooltip label={`Заполнялся дневник ${current} дней подряд`}>
            <Group
                gap={4}
                align="center">
                <IconFlame
                    size={iconSize}
                    color={isActive ? "#e03131" : "#adb5bd"}
                />
                <Text
                    size={textSize}
                    fw={600}
                    c={isActive ? "red.7" : "dimmed"}>
                    {current} дней
                </Text>
            </Group>
        </Tooltip>
    );
}
