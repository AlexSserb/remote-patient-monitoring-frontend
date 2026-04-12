import { Card, Center, Stack, Title } from "@mantine/core";
import type { ReactNode } from "react";

interface AuthCardProps {
    title: string;
    children: ReactNode;
}

export function AuthCard({ title, children }: AuthCardProps) {
    return (
        <Center
            mih="100dvh"
            p="md">
            <Card
                shadow="sm"
                padding="xl"
                radius="md"
                withBorder
                w="100%"
                maw={420}>
                <Stack gap="lg">
                    <Title
                        order={2}
                        ta="center">
                        {title}
                    </Title>
                    {children}
                </Stack>
            </Card>
        </Center>
    );
}
