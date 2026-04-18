import { Badge, Group, Tooltip } from "@mantine/core";

interface NameListCellItem {
    label: string;
    tooltip?: string;
}

interface NameListCellProps {
    items: NameListCellItem[];
    maxVisible?: number;
    color?: string;
}

export function NameListCell({ items, maxVisible = 2, color }: NameListCellProps) {
    if (items.length === 0) return <span>—</span>;

    const visible = items.slice(0, maxVisible);
    const overflow = items.slice(maxVisible);

    return (
        <Group
            gap={4}
            wrap="nowrap">
            {visible.map((item, i) => (
                <Tooltip
                    key={i}
                    label={item.tooltip ?? item.label}
                    disabled={!item.tooltip}>
                    <Badge
                        size="sm"
                        variant="light"
                        color={color}
                        style={{ cursor: "default" }}>
                        {item.label}
                    </Badge>
                </Tooltip>
            ))}
            {overflow.length > 0 && (
                <Tooltip
                    label={overflow.map(i => i.tooltip ?? i.label).join("\n")}
                    multiline
                    maw={220}
                    style={{ whiteSpace: "pre-line" }}>
                    <Badge
                        size="sm"
                        variant="outline"
                        color="gray"
                        style={{ cursor: "default" }}>
                        +{overflow.length}
                    </Badge>
                </Tooltip>
            )}
        </Group>
    );
}
