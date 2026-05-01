"use client";

import { useState } from "react";
import { ActionIcon, Alert, Group, Loader, Paper, SimpleGrid, Stack, Title, Tooltip } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useAnalytics } from "../hooks/useAnalytics";
import { MetricsSelector } from "./MetricsSelector";
import { DateRangeFilter } from "./DateRangeFilter";
import { MetricsChart } from "./MetricsChart";

function toIsoDate(d: Date): string {
    return d.toISOString().slice(0, 10);
}

function defaultDateFrom(): Date {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d;
}

interface AnalyticsContentProps {
    patientId?: number;
}

export function AnalyticsContent({ patientId }: AnalyticsContentProps) {
    const router = useRouter();
    const [dateFrom, setDateFrom] = useState<Date>(defaultDateFrom);
    const [dateTo, setDateTo] = useState<Date>(new Date());
    const [selectedMetricIds, setSelectedMetricIds] = useState<number[]>([]);

    const { metrics, dataPoints, isLoading, error } = useAnalytics({
        patientId,
        dateFrom: toIsoDate(dateFrom),
        dateTo: toIsoDate(dateTo),
        metricIds: selectedMetricIds,
    });

    return (
        <Stack
            px="xl"
            pt="md"
            pb="xl"
            gap="md">
            <Group gap="sm">
                <Tooltip label="Назад">
                    <ActionIcon
                        variant="subtle"
                        color="gray"
                        onClick={() => router.back()}
                        aria-label="Назад">
                        <IconArrowLeft />
                    </ActionIcon>
                </Tooltip>
                <Title order={2}>Аналитика</Title>
            </Group>

            {error && <Alert color="red">{error}</Alert>}

            <SimpleGrid
                cols={{ base: 1, sm: 3 }}
                spacing="md">
                <Paper
                    withBorder
                    p="md">
                    <Stack gap="md">
                        <DateRangeFilter
                            dateFrom={dateFrom}
                            dateTo={dateTo}
                            onChangeDateFrom={setDateFrom}
                            onChangeDateTo={setDateTo}
                        />
                        <MetricsSelector
                            metrics={metrics}
                            selectedIds={selectedMetricIds}
                            onChange={setSelectedMetricIds}
                            disabled={isLoading}
                        />
                    </Stack>
                </Paper>

                <Paper
                    withBorder
                    p="md"
                    style={{ gridColumn: "span 2" }}>
                    {isLoading ? (
                        <Group
                            justify="center"
                            h={300}>
                            <Loader />
                        </Group>
                    ) : (
                        <MetricsChart
                            metrics={metrics}
                            selectedIds={selectedMetricIds}
                            dataPoints={dataPoints}
                        />
                    )}
                </Paper>
            </SimpleGrid>
        </Stack>
    );
}
