"use client";

import { Stack, Switch, Text } from "@mantine/core";
import { useEmailSubscription } from "../hooks/useEmailSubscription";

interface EmailSwitchProps {
    userId: number;
}

export function EmailSwitch({ userId }: EmailSwitchProps) {
    const { state, error, enable, disable } = useEmailSubscription(userId);

    return (
        <Stack gap={4}>
            <Switch
                label="Email-уведомления"
                checked={state === "enabled"}
                disabled={state === "loading"}
                onChange={e => void (e.currentTarget.checked ? enable() : disable())}
            />
            {error && <Text size="xs" c="red">{error}</Text>}
        </Stack>
    );
}
