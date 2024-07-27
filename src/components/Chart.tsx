"use client";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "~/components/ui/card";
import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "~/components/ui/chart";
import { type Run } from "~/server/db/schema";

const chartConfig = {
    passed: {
        label: "Passed",
        color: "hsl(var(--chart-1))",
    },
    failed: {
        label: "Failed",
        color: "hsl(var(--chart-2))",
    },
    skipped: {
        label: "Skipped",
        color: "hsl(var(--chart-3))",
    },
    flaky: {
        label: "Flaky",
        color: "hsl(var(--chart-4))",
    },
} satisfies ChartConfig;

interface RunsChartProps {
    runs: Run[];
}

export function RunsChart({ runs }: RunsChartProps) {
    const chartData = runs.map((run) => ({
        date: run.createdAt,
        passed: run.expected,
        failed: run.unexpected,
        skipped: run.skipped,
        flaky: run.flaky,
    }));

    return (
        <Card>
            <CardHeader>
                <CardTitle>Runs</CardTitle>
                <CardDescription>Showing run details</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <AreaChart
                        accessibilityLayer
                        data={chartData.reverse()}
                        margin={{
                            left: 12,
                            right: 12,
                            top: 12,
                        }}
                        stackOffset="expand"
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="line" />}
                        />
                        {Object.keys(chartConfig).map((key) => (
                            <Area
                                key={key}
                                dataKey={key}
                                type="natural"
                                fill={`var(--color-${key})`}
                                fillOpacity={0.4}
                                stroke={`var(--color-${key})`}
                                stackId="a"
                            />
                        ))}
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
