"use client";

import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
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
                <CardTitle>Area Chart - Stacked</CardTitle>
                <CardDescription>
                    Showing test results for latest 20 runs
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <AreaChart
                        accessibilityLayer
                        data={chartData}
                        margin={{
                            left: 12,
                            right: 12,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            //tickFormatter={(value) => value.slice(0, 3)}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="dot" />}
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
            <CardFooter>
                <div className="flex w-full items-start gap-2 text-sm">
                    <div className="grid gap-2">
                        <div className="flex items-center gap-2 font-medium leading-none">
                            Trending up by 5.2% this month{" "}
                            <TrendingUp className="h-4 w-4" />
                        </div>
                        <div className="flex items-center gap-2 leading-none text-muted-foreground">
                            January - June 2024
                        </div>
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
}
