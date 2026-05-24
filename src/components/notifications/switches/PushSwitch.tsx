"use client";

import { Stack, Switch, Text } from "@mantine/core";
import { usePushSubscription } from "../hooks/usePushSubscription";

export function PushSwitch() {
    const { state, error, subscribe, unsubscribe } = usePushSubscription();

    return (
        <Stack gap={4}>
            <Switch
                label="Push-уведомления"
                checked={state === "subscribed"}
                disabled={state === "loading" || state === "unsupported" || state === "denied"}
                onChange={e => void (e.currentTarget.checked ? subscribe() : unsubscribe())}
            />
            {state === "unsupported" && (
                <Text size="xs" c="dimmed">
                    Ваш браузер не поддерживает push-уведомления.
                </Text>
            )}
            {state === "denied" && (
                <Text size="xs" c="red">
                    Уведомления заблокированы. Разрешите их в настройках браузера.
                </Text>
            )}
            {error && <Text size="xs" c="red">{error}</Text>}
        </Stack>
    );
}
