import { type NextRequest, NextResponse } from "next/server";
import { parseHtmlReport, type BuildInfo } from "~/lib/parser";
import { verifyApiKey } from "../middleware";
import { saveReport } from "~/server/queries/report";

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
    const indexHtml = formData.get("file") as File;

    if (!indexHtml) {
        return NextResponse.json(
            { error: "Index file not found" },
            { status: 400 }
        );
    }

    const content = await indexHtml.text();
    const report = await parseHtmlReport(content);

    if (!report) {
        return NextResponse.json(
            { error: "Invalid report format" },
            { status: 400 }
        );
    }

    const createdRun = await saveReport({
        createdBy: apiKeyName,
        teamId: params.teamId,
        projectId: params.projectId,
        report: { ...report, ...searchParams },
        saveReportLocally: false,
    });

    if (!createdRun) {
        return NextResponse.json(
            { error: "Failed to save report data" },
            { status: 500 }
        );
    }

    return NextResponse.json({
        message: "Report data saved successfully",
        run: createdRun,
    });
}
