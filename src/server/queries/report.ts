"use server";
import fs from "node:fs";

import { and, asc, desc, eq, gt, lt, ne } from "drizzle-orm";

import { auth } from "~/auth";
import { env } from "~/env";
import { type BuildInfo, type Report } from "~/lib/parser";
import { db } from "~/server/db";
import { files, runs, testAttachments, tests } from "~/server/db/schema";

import { userIsAdmin } from "./users";

interface SaveReportInput {
    createdBy: string;
    teamId: string;
    projectId: string;
    report: Report & BuildInfo;
    saveReportLocally?: boolean;
}

export const saveReport = async (input: SaveReportInput) => {
    return await db.transaction(async (tx) => {
        const { createdBy, teamId, projectId, report, saveReportLocally } =
            input;

        const runId = crypto.randomUUID();

        const reportUrl = saveReportLocally
            ? `${env.AUTH_URL}/reports/${teamId}/${projectId}/${runId}`
            : report.reportUrl;

        const durationMilliseconds = Math.round(report.duration);
        const finishedAt = report.startTime + durationMilliseconds;

        const run = await tx
            .insert(runs)
            .values({
                id: runId,
                projectId,
                workers: report?.metadata?.actualWorkers ?? 1,
                startedAt: new Date(report.startTime),
                finishedAt: new Date(finishedAt),
                duration: durationMilliseconds,
                createdBy: createdBy,
                reportUrl: reportUrl ?? "",
                buildName: report.buildName ?? "",
                buildUrl: report.buildUrl ?? "",
                total: report.stats.total,
                expected: report.stats.expected,
                unexpected: report.stats.unexpected,
                flaky: report.stats.flaky,
                skipped: report.stats.skipped,
                ok: report.stats.ok,
            })
            .returning();

        const createdRun = run.at(0);

        if (!createdRun) {
            return;
        }

        for (const file of report.files) {
            const created = await tx
                .insert(files)
                .values({
                    runId: createdRun.id,
                    projectId,
                    name: file.fileName,
                    fileId: file.fileId,
                    total: file.stats.total,
                    expected: file.stats.expected,
                    unexpected: file.stats.unexpected,
                    flaky: file.stats.flaky,
                    skipped: file.stats.skipped,
                    ok: file.stats.ok,
                })
                .returning();

            const createdFile = created.at(0);

            if (!createdFile) {
                return;
            }

            for (const test of file.tests) {
                const created = await tx
                    .insert(tests)
                    .values({
                        projectId,
                        runId: createdRun.id,
                        fileId: createdFile.id,
                        location: `${test.location.file} ${test.location.line}:${test.location.column}`,
                        testId: test.testId,
                        title: test.title,
                        pwProjectName: test.projectName,
                        duration: test.duration,
                        outcome: test.outcome,
                        path: test.path.join(" / "),
                    })
                    .returning();

                const createdTest = created.at(0);

                if (!createdTest) {
                    return;
                }

                for (const [index, result] of test.results.entries()) {
                    for (const attachment of result.attachments) {
                        const created = await tx
                            .insert(testAttachments)
                            .values({
                                projectId,
                                runId: createdRun.id,
                                testId: createdTest.id,
                                attempt: index + 1,
                                name: attachment.name,
                                contentType: attachment.contentType,
                                path: attachment.path,
                            })
                            .returning();

                        if (!created.at(0)) {
                            return;
                        }
                    }
                }
            }
        }

        return createdRun;
    });
};

export const getRunNeighbors = async (runId: string) => {
    const found = await db.select().from(runs).where(eq(runs.id, runId));

    const [run] = found;

    if (!run) {
        return null;
    }

    const [prevRun] = await db
        .select()
        .from(runs)
        .where(
            and(
                eq(runs.projectId, run.projectId),
                lt(runs.createdAt, run.createdAt)
            )
        )
        .orderBy(desc(runs.createdAt))
        .limit(1);

    const [nextRun] = await db
        .select()
        .from(runs)
        .where(
            and(
                eq(runs.projectId, run.projectId),
                gt(runs.createdAt, run.createdAt),
                ne(runs.id, run.id)
            )
        )
        .orderBy(asc(runs.createdAt))
        .limit(1);

    return {
        nextRunId: !!nextRun && nextRun.id !== run.id && nextRun.id,
        prevRunId: !!prevRun && prevRun.id !== run.id && prevRun.id,
    };
};

export const deleteRun = async (runId: string, teamId: string) => {
    const session = await auth();
    const hasAccess = await userIsAdmin(session?.user?.id, teamId);

    if (!hasAccess) {
        return { error: "Unauthorized" };
    }

    const [run] = await db.select().from(runs).where(eq(runs.id, runId));

    if (!run) {
        return {
            error: "Run not found",
        };
    }

    return await db.transaction(async (tx) => {
        await tx
            .delete(testAttachments)
            .where(eq(testAttachments.runId, runId));
        await tx.delete(tests).where(eq(tests.runId, runId));
        await tx.delete(files).where(eq(files.runId, runId));
        await tx.delete(runs).where(eq(runs.id, runId));
        if (run.reportUrl?.includes(env.NEXT_PUBLIC_AUTH_URL)) {
            const path = `${process.cwd()}/reports/${teamId}/${
                run.projectId
            }/${runId}`;
            fs.existsSync(path) &&
                fs.rmdirSync(path, {
                    recursive: true,
                });
        }
    });
};
