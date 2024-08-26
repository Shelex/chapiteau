import { promises as fs } from "fs";
import { type NextRequest, NextResponse } from "next/server";
import path from "path";

import { type BuildInfo, parseHtmlReport } from "~/lib";
import { saveReport, withError } from "~/server/queries";

import { verifyApiKey } from "../middleware";

export async function POST(
    req: NextRequest,
    {
        params,
        searchParams,
    }: {
        params: { teamId: string; projectId: string };
        searchParams: BuildInfo;
    }
) {
    const { error, apiKeyName } = await verifyApiKey(req, params.teamId);
    if (error) {
        return error;
    }

    if (!apiKeyName) {
        return NextResponse.json(
            { message: "API key name not found" },
            { status: 400 }
        );
    }

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    const indexHtml = files.find((file) => file.name === "index.html");

    if (!indexHtml) {
        return NextResponse.json(
            { message: "No index.html file found in the uploaded files" },
            { status: 400 }
        );
    }

    const report = await parseHtmlReport(await indexHtml.text());

    if (!report) {
        return NextResponse.json(
            { message: "Invalid report format" },
            { status: 400 }
        );
    }

    const { result: createdRun, error: saveReportError } = await withError(
        saveReport({
            createdBy: apiKeyName,
            teamId: params.teamId,
            projectId: params.projectId,
            report: { ...report, ...searchParams },
            saveReportLocally: true,
        })
    );

    if (saveReportError ?? !createdRun) {
        return NextResponse.json(
            {
                error: `Failed to save report data: ${
                    saveReportError?.message ?? ""
                }`,
            },
            { status: 400 }
        );
    }

    const baseDestination = path.join(
        process.cwd(),
        "reports",
        params.teamId,
        params.projectId,
        `${createdRun.numericId}`
    );

    console.log(
        `going to save report for run ${createdRun.id} to ${baseDestination}`
    );

    try {
        await fs.mkdir(baseDestination, { recursive: true });

        for (const file of files) {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const relativePath = file.name;
            const fullDestinationPath = path.join(
                baseDestination,
                relativePath
            );
            const destinationDir = path.dirname(fullDestinationPath);

            await fs.mkdir(destinationDir, { recursive: true });
            await fs.writeFile(fullDestinationPath, buffer);
        }
    } catch (e) {
        console.error("Failed to save report files", e);
        return NextResponse.json(
            { error: "Failed to save report files" },
            { status: 400 }
        );
    }

    return NextResponse.json({
        message: "Files uploaded successfully",
        run: createdRun,
    });
}
