import { type Report, type BuildInfo } from "~/lib/parser";
import { files, runs, testAttachments, tests } from "../db/schema";
import { db } from "../db";
import { env } from "~/env";

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
                expected: report.stats.total,
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
