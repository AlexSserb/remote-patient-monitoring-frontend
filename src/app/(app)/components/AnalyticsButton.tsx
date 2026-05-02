"use client";

import { ActionIcon, Tooltip } from "@mantine/core";
import { IconChartLine } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

interface AnalyticsButtonProps {
    patientId: number;
}

export function AnalyticsButton({ patientId }: AnalyticsButtonProps) {
    const router = useRouter();
    return (
        <Tooltip label="Аналитика пациента">
            <ActionIcon
                variant="light"
                color="violet"
                onClick={() => router.push(`/analytics?patientId=${patientId}`)}
                aria-label="Аналитика пациента">
                <IconChartLine />
            </ActionIcon>
        </Tooltip>
    );
}
