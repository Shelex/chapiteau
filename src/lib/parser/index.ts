import JSZip from "jszip";

import { type Report } from "./types";
export * from "./types";

export const parse = async (html: string) => {
    const base64Prefix = "data:application/zip;base64,";
    const start =
        html.indexOf('window.playwrightReportBase64 = "') +
        'window.playwrightReportBase64 = "'.length;
    const end = html.indexOf('";', start);
    const base64String = html
        .substring(start, end)
        .trim()
        .replace(base64Prefix, "");

    const zipData = Buffer.from(base64String, "base64");
    const zip = await JSZip.loadAsync(zipData);

    const reportFile = zip.file("report.json");
    if (!reportFile) {
        throw Error("no report.json file found in the zip");
    }

    const reportJson = await reportFile.async("string");

    return JSON.parse(reportJson) as Report;
};

export const parseHtmlReport = async (html: string) => {
    try {
        return parse(html);
    } catch (e) {
        return null;
    }
};
