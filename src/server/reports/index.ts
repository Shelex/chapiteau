import { env } from "~/env";

import { fsPersist } from "./fs";
import { MinioPersist } from "./minio";

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
        result: string | Buffer | null;
        error: Error | null;
    }>;
    clear: (path: string) => Promise<void>;
}

export const reportHandler = (
    env.REPORT_PERSIST === "fs" ? fsPersist : new MinioPersist()
) satisfies ReportHandler;
