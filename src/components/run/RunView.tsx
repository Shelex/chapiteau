"use client";
import { Button } from "@nextui-org/button";
import { Accordion, AccordionItem, Chip } from "@nextui-org/react";
import Link from "next/link";

import { type Run } from "~/server/db/schema";

import { StatChart } from "../charts/StatsChart";
import DeleteRunButton from "./DeleteRunButton";

interface RunsProps {
    run: Run;
    teamId: string;
    isAdmin: boolean;
}

const parseMilliseconds = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const leftMs = ms % 1000;
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
        return `${hours}h ${minutes % 60}m ${seconds % 60}s ${leftMs}ms`;
    }

    if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s ${leftMs}ms`;
    }

    if (seconds > 0) {
        return `${seconds}s ${leftMs}ms`;
    }

    return `${leftMs}ms`;
};

export default function RunView({ teamId, run, isAdmin }: Readonly<RunsProps>) {
    return (
        <div className="w-full min-h-max">
            <div key={run.id}>
                <h2 className="text-lg font-semibold">{run.id}</h2>
                <div className="flex flex-row justify-between p-2">
                    {run.reportUrl && (
                        <Link href={run.reportUrl}>
                            <Button>Open Report</Button>
                        </Link>
                    )}
                    {isAdmin && (
                        <DeleteRunButton teamId={teamId} runId={run.id} />
                    )}
                </div>
                <div className="flex flex-row justify-between p-1">
                    <div className="w-full h-full">
                        <StatChart stats={run} />
                    </div>
                    <div className="w-1/2 h-full text-left pl-2 mt-2">
                        <div>
                            Status:{" "}
                            <Chip color={run.ok ? "success" : "danger"}>
                                {run.ok ? "Passed" : "Failed"}
                            </Chip>
                        </div>
                        <p>Workers: {run.workers}</p>
                        <p>StartedAt: {run.startedAt.toLocaleString()}</p>
                        <p>FinishedAt: {run.finishedAt.toLocaleString()}</p>
                        <p>CreatedAt: {run.createdAt.toLocaleString()}</p>
                        <p>Duration: {parseMilliseconds(run.duration)}</p>
                        <p>CreatedBy: {run.createdBy}</p>
                        {run.buildName && <p>BuildName: {run.buildName}</p>}
                        {run.buildUrl && <p>BuildUrl: {run.buildUrl}</p>}
                    </div>
                </div>
            </div>
            {run.reportUrl && (
                <Accordion
                    className="mt-5 bg-primary-100"
                    variant="bordered"
                >
                    <AccordionItem
                        key="1"
                        aria-label="Report Preview"
                        title="Report Preview"
                        className="justify-center"
                    >
                        <iframe
                            className="w-[600px] h-[400px] rounded-lg"
                            src={run.reportUrl}
                        />
                    </AccordionItem>
                </Accordion>
            )}
        </div>
    );
}
