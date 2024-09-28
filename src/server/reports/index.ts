import { env } from "~/env";

import { fsStorage } from "./fs";
import { S3 } from "./minio";

interface ReportHandler {
    write: (
        teamId: string,
        projectId: string,
        runNumber: number,
        files: File[]
    ) => Promise<void>;
    read: (
        targetPath: string,
        contentType?: string | null
    ) => Promise<{
        result?: string | Buffer | null;
        error: Error | null;
    }>;
    clear: (path: string) => Promise<void>;
}

export const reportHandler = (
    env.REPORT_STORAGE === "s3" ? S3.getInstance() : fsStorage
) satisfies ReportHandler;
