"use client";

import * as React from "react";
import { Label, Pie, PieChart } from "recharts";

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

const chartConfig = {
    count: {
        label: "Count",
    },
    expected: {
        label: "Passed",
        color: "hsl(var(--chart-1))",
    },
    unexpected: {
        label: "Failed",
        color: "hsl(var(--chart-2))",
    },
    flaky: {
        label: "Flaky",
        color: "hsl(var(--chart-3))",
    },
    skipped: {
        label: "Skipped",
        color: "hsl(var(--chart-4))",
    },
} satisfies ChartConfig;

interface StatChartProps {
    stats: {
        total: number;
        expected: number;
        unexpected: number;
        flaky: number;
        skipped: number;
        ok: boolean;
    };
}

export function StatChart({ stats }: StatChartProps) {
    const chartData = [
        {
            count: stats.expected,
            status: "Passed",
            fill: "hsl(var(--chart-1))",
        },
        {
            count: stats.unexpected,
            status: "Failed",
            fill: "hsl(var(--chart-2))",
        },
        { count: stats.flaky, status: "Flaky", fill: "hsl(var(--chart-4))" },
        {
            count: stats.skipped,
            status: "Skipped",
            fill: "hsl(var(--chart-3))",
        },
    ];

    return (
        <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
                <CardTitle>Stats</CardTitle>
                <CardDescription>Total {stats.total} tests</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[250px]"
                >
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Pie
                            data={chartData}
                            dataKey="count"
                            nameKey="status"
                            innerRadius={60}
                            strokeWidth={5}
                        >
                            <Label
                                content={({ viewBox }) => {
                                    if (
                                        viewBox &&
                                        "cx" in viewBox &&
                                        "cy" in viewBox
                                    ) {
                                        return (
                                            <text
                                                x={viewBox.cx}
                                                y={viewBox.cy}
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                            >
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    className="fill-foreground text-3xl font-bold"
                                                >
                                                    {`${Math.round(
                                                        (stats.expected /
                                                            (stats.total -
                                                                stats.skipped)) *
                                                            100
                                                    )}%`}
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy ?? 0) + 24}
                                                    className="fill-muted-foreground"
                                                >
                                                    Passed
                                                </tspan>
                                            </text>
                                        );
                                    }
                                }}
                            />
                        </Pie>
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
