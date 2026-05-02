"use client";

import { Center, Text } from "@mantine/core";
import { LineChart } from "@mantine/charts";
import "@mantine/charts/styles.css";
import type { AnalyticsDataPoint, AnalyticsMetric } from "@/client/types.gen";

interface MetricsChartProps {
    metrics: AnalyticsMetric[];
    selectedIds: number[];
    dataPoints: AnalyticsDataPoint[];
}

const CHART_COLORS = ["blue", "red", "green", "orange", "grape", "teal", "cyan", "pink", "yellow", "indigo"];

export function MetricsChart({ metrics, selectedIds, dataPoints }: MetricsChartProps) {
    if (selectedIds.length === 0) {
        return (
            <Center h={300}>
                <Text c="dimmed">Выберите метрики для отображения на графике</Text>
            </Center>
        );
    }

    if (dataPoints.length === 0) {
        return (
            <Center h={300}>
                <Text c="dimmed">Нет данных за выбранный период</Text>
            </Center>
        );
    }

    const selectedMetrics = metrics.filter(m => selectedIds.includes(m.id));

    // Group by exact entry timestamp: metric values from the same diary entry share
    // the same created_at, so they land on one point; separate entries on the same
    // day become distinct points instead of overwriting each other.
    const byTimestamp = new Map<string, Record<string, number>>();
    for (const point of dataPoints) {
        if (!byTimestamp.has(point.date)) byTimestamp.set(point.date, {});
        byTimestamp.get(point.date)![String(point.metricId)] = point.value;
    }

    const chartData = Array.from(byTimestamp.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([ts, values]) => ({
            date: new Intl.DateTimeFormat("ru-RU", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
            }).format(new Date(ts)),
            ...values,
        }));

    const series = selectedMetrics.map((m, i) => ({
        name: String(m.id),
        label: m.unit ? `${m.name} (${m.unit})` : m.name,
        color: CHART_COLORS[i % CHART_COLORS.length],
    }));

    return (
        <LineChart
            h={340}
            data={chartData}
            dataKey="date"
            series={series}
            curveType="monotone"
            withLegend
            withTooltip
            withDots
            connectNulls={false}
        />
    );
}
