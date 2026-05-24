"use client";

import { Stack, Switch, Text } from "@mantine/core";
import { useInAppSubscription } from "../hooks/useInAppSubscription";

interface InAppSwitchProps {
    userId: number;
}

export function InAppSwitch({ userId }: InAppSwitchProps) {
    const { state, error, enable, disable } = useInAppSubscription(userId);

    return (
        <Stack gap={4}>
            <Switch
                label="Уведомления в приложении"
                checked={state === "enabled"}
                disabled={state === "loading"}
                onChange={e => void (e.currentTarget.checked ? enable() : disable())}
            />
            {error && <Text size="xs" c="red">{error}</Text>}
        </Stack>
    );
}
