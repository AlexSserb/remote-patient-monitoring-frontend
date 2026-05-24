"use client";

import { useState } from "react";
import { Stack, Switch, Text } from "@mantine/core";
import { useVkSubscription } from "../hooks/useVkSubscription";
import { VkSetupModal } from "../VkSetupModal";

interface VkSwitchProps {
    userId: number;
    /** true — настраиваем для себя, false — для другого пользователя */
    isOwn: boolean;
    /** Имя пользователя, для которого настраиваем (показывается в модалке при isOwn=false) */
    targetName: string | null;
}

export function VkSwitch({ userId, isOwn, targetName }: VkSwitchProps) {
    const { state, error, disable, generateToken, refetchStatus } = useVkSubscription(userId);
    const [setupOpen, setSetupOpen] = useState(false);

    function handleToggle(checked: boolean): void {
        if (checked) {
            setSetupOpen(true);
        } else {
            void disable();
        }
    }

    return (
        <>
            <Stack gap={4}>
                <Switch
                    label="VK-уведомления"
                    checked={state === "enabled"}
                    disabled={state === "loading"}
                    onChange={e => handleToggle(e.currentTarget.checked)}
                />
                {error && <Text size="xs" c="red">{error}</Text>}
            </Stack>

            <VkSetupModal
                opened={setupOpen}
                onClose={() => setSetupOpen(false)}
                isOwnAccount={isOwn}
                targetName={targetName}
                generateToken={generateToken}
                vkState={state}
                onLinked={refetchStatus}
            />
        </>
    );
}
