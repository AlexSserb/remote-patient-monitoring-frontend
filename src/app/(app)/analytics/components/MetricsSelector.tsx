"use client";

import { MultiSelect } from "@mantine/core";
import type { AnalyticsMetric } from "@/client/types.gen";

interface MetricsSelectorProps {
    metrics: AnalyticsMetric[];
    selectedIds: number[];
    onChange: (ids: number[]) => void;
    disabled?: boolean;
}

export function MetricsSelector({ metrics, selectedIds, onChange, disabled }: MetricsSelectorProps) {
    const data = metrics.map(m => ({
        value: String(m.id),
        label: m.unit ? `${m.name} (${m.unit})` : m.name,
    }));

    return (
        <MultiSelect
            label="Метрики"
            placeholder="Выберите метрики для отображения"
            data={data}
            value={selectedIds.map(String)}
            onChange={v => onChange(v.map(Number))}
            disabled={disabled}
            searchable
            clearable
        />
    );
}
