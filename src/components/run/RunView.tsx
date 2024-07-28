"use client";
import { Button } from "@nextui-org/button";
import Link from "next/link";

import { type Run } from "~/server/db/schema";

import { StatChart } from "../charts/StatsChart";
import DeleteRunButton from "./DeleteRunButton";

interface RunsProps {
    run: Run;
    teamId: string;
    isAdmin: boolean;
}

export default function RunView({ teamId, run, isAdmin }: Readonly<RunsProps>) {
    return (
        <div className="p-4">
            <div key={run.id}>
                <h2 className="text-lg font-semibold">{run.id}</h2>
                {run.reportUrl && (
                    <Link href={run.reportUrl}>
                        <Button>Open Report</Button>
                    </Link>
                )}
                {!isAdmin && <DeleteRunButton teamId={teamId} runId={run.id} />}
                <p>Run status: {run.ok ? "Passed" : "Failed"}</p>
                <p>CreatedAt: {run.createdAt.toString()}</p>
                <StatChart stats={run} />
                <p>Workers: {run.workers}</p>
                <p>StartedAt: {run.startedAt.toString()}</p>
                <p>FinishedAt: {run.finishedAt.toString()}</p>
                <p>Duration: {run.duration} ms</p>
                <p>CreatedBy: {run.createdBy}</p>
                {run.buildName && <p>BuildName: {run.buildName}</p>}
                {run.buildUrl && <p>BuildUrl: {run.buildUrl}</p>}
            </div>
        </div>
    );
}
