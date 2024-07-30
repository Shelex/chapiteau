"use client";
import { Area, AreaChart, XAxis } from "recharts";

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
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "~/components/ui/chart";
import { type Run } from "~/server/db/schema";

const chartConfig = {
    failed: {
        label: "Failed",
        color: "hsl(var(--chart-2))",
    },
    flaky: {
        label: "Flaky",
        color: "hsl(var(--chart-4))",
    },
    passed: {
        label: "Passed",
        color: "hsl(var(--chart-1))",
    },
    skipped: {
        label: "Skipped",
        color: "hsl(var(--chart-3))",
    },
} satisfies ChartConfig;

interface RunsChartProps {
    runs: Run[];
}

export function RunsChart({ runs }: RunsChartProps) {
    const getPercentage = (value: number, total: number) =>
        Math.round((value / total) * 100);

    const chartData = runs.map((run) => ({
        date: run.createdAt.getTime(),
        passed: getPercentage(run.expected, run.total),
        passedCount: run.expected,
        failed: getPercentage(run.unexpected, run.total),
        failedCount: run.unexpected,
        skipped: getPercentage(run.skipped, run.total),
        skippedCount: run.skipped,
        flaky: getPercentage(run.flaky, run.total),
        flakyCount: run.flaky,
        total: run.total,
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
                        }}
                    >
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={10}
                            tickFormatter={(value: number) => {
                                return new Date(value).toLocaleDateString(
                                    undefined,
                                    {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                    }
                                );
                            }}
                        />
                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    hideLabel
                                    className="w-[180px]"
                                    formatter={(value, name, item, index) => (
                                        <>
                                            <div
                                                className="h-2.5 w-2.5 shrink-0 rounded-[2px] bg-[--color-bg]"
                                                style={
                                                    {
                                                        "--color-bg": `var(--color-${name})`,
                                                    } as React.CSSProperties
                                                }
                                            />
                                            {chartConfig[
                                                name as keyof typeof chartConfig
                                            ]?.label || name}
                                            <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
                                                {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
                                                {item.payload[`${name}Count`]} (
                                                {value}%)
                                            </div>
                                            {/* Add this after the last item */}
                                            {index === 3 && (
                                                <>
                                                    <div className="mt-1.5 flex basis-full items-center border-t pt-1.5 text-xs font-medium text-foreground">
                                                        Total
                                                        <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
                                                            {
                                                                (
                                                                    item.payload as Run
                                                                ).total
                                                            }
                                                            <span className="font-normal text-muted-foreground">
                                                                tests
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="mt-1.5 flex basis-full items-center border-t pt-1.5 text-xs font-medium text-foreground">
                                                        Created At
                                                        <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
                                                            {new Date(
                                                                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
                                                                item.payload.date
                                                            ).toLocaleString()}
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </>
                                    )}
                                />
                            }
                            cursor={true}
                        />
                        {Object.keys(chartConfig).map((key) => (
                            <Area
                                key={key}
                                dataKey={key}
                                stackId="a"
                                fill={`var(--color-${key})`}
                                fillOpacity={0.7}
                                stroke={`var(--color-${key})`}
                            />
                        ))}
                        <ChartLegend content={<ChartLegendContent />} />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
