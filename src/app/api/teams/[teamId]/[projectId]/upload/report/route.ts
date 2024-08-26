import { type NextRequest, NextResponse } from "next/server";

import { type BuildInfo, parseHtmlReport, withError } from "~/lib";
import { saveReport } from "~/server/queries";
import { reportHandler } from "~/server/reports";

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

    const { error: persistReportError } = await withError(
        reportHandler.write(
            params.teamId,
            params.projectId,
            createdRun.numericId,
            files
        )
    );

    if (persistReportError) {
        console.error("Failed to save report files", persistReportError);
        return NextResponse.json(
            {
                error: `Failed to save report files ${persistReportError.message}`,
            },
            { status: 400 }
        );
    }

    return NextResponse.json({
        message: "Files uploaded successfully",
        run: createdRun,
    });
}
