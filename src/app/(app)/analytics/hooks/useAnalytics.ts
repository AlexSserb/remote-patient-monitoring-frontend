"use client";

import { useEffect, useState } from "react";
import type { AnalyticsDataPoint, AnalyticsMetric, AnalyticsResponse } from "@/client/types.gen";

export type { AnalyticsDataPoint, AnalyticsMetric };

interface UseAnalyticsParams {
    patientId?: number;
    dateFrom: string;
    dateTo: string;
    metricIds: number[];
}

interface UseAnalyticsResult {
    metrics: AnalyticsMetric[];
    dataPoints: AnalyticsDataPoint[];
    isLoading: boolean;
    error: string | null;
}

export function useAnalytics({ patientId, dateFrom, dateTo, metricIds }: UseAnalyticsParams): UseAnalyticsResult {
    const [metrics, setMetrics] = useState<AnalyticsMetric[]>([]);
    const [dataPoints, setDataPoints] = useState<AnalyticsDataPoint[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Stable string key so the array reference change doesn't re-trigger the effect
    const metricIdsKey = metricIds.join(",");

    useEffect(() => {
        setIsLoading(true);
        setError(null);

        const params = new URLSearchParams({ date_from: dateFrom, date_to: dateTo });
        if (patientId !== undefined) params.set("patient_id", String(patientId));
        if (metricIdsKey) params.set("metric_ids", metricIdsKey);

        fetch(`/api/analytics?${params.toString()}`)
            .then(res => {
                if (!res.ok) throw new Error(`Ошибка загрузки: ${res.status}`);
                return res.json() as Promise<AnalyticsResponse>;
            })
            .then(data => {
                setMetrics(data.availableMetrics);
                setDataPoints(data.dataPoints);
            })
            .catch((err: unknown) => {
                setError(err instanceof Error ? err.message : "Неизвестная ошибка");
            })
            .finally(() => setIsLoading(false));
    }, [patientId, dateFrom, dateTo, metricIdsKey]);

    return { metrics, dataPoints, isLoading, error };
}
