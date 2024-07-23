"use client";
import { type Run } from "~/server/db/schema";

interface RunsProps {
    runs: Run[];
}

export default function Runs({ runs = [] }: RunsProps) {
    return (
        <div className="p-4">
            {runs.map((run) => {
                return (
                    <div key={run.id}>
                        <h2 className="text-lg font-semibold">{run.id}</h2>
                        <p>Id: {run.id}</p>
                        <p>ProjectId: {run.projectId}</p>
                        <p>Workers: {run.workers}</p>
                        <p>StartedAt: {run.startedAt.toLocaleString()}</p>
                        <p>FinishedAt: {run.finishedAt.toLocaleString()}</p>
                        <p>Duration: {run.duration}</p>
                        <p>CreatedAt: {run.createdAt.toLocaleString()}</p>
                        <p>CreatedBy: {run.createdBy}</p>
                        <p>ReportUrl: {run.reportUrl}</p>
                        <p>BuildName: {run.buildName}</p>
                        <p>BuildUrl: {run.buildUrl}</p>
                        <p>Total: {run.total}</p>
                        <p>Expected: {run.expected}</p>
                        <p>Unexpected: {run.unexpected}</p>
                        <p>Flaky: {run.flaky}</p>
                        <p>Skipped: {run.skipped}</p>
                        <p>Ok: {run.ok}</p>
                    </div>
                );
            })}
        </div>
    );
}
