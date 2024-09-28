import fs from "node:fs/promises";
import path from "node:path";

import { withError } from "~/lib";

const clear = async (dest: string) => {
    await fs.rm(path.join(process.cwd(), "reports", dest), {
        recursive: true,
        force: true,
    });
};

const write = async (
    teamId: string,
    projectId: string,
    runNumber: number,
    files: File[]
) => {
    const destination = path.join(
        process.cwd(),
        "reports",
        teamId,
        projectId,
        `${runNumber}`
    );

    console.log(`going to save report for run ${runNumber} to ${destination}`);

    await fs.mkdir(destination, { recursive: true });

    for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const relativePath = file.name;
        const fullDestinationPath = path.join(destination, relativePath);
        const destinationDir = path.dirname(fullDestinationPath);

        await fs.mkdir(destinationDir, { recursive: true });
        await fs.writeFile(fullDestinationPath, buffer);
    }
};

const read = async (targetPath: string, contentType?: string | null) => {
    return withError(
        fs.readFile(path.join(process.cwd(), "reports", targetPath), {
            encoding: contentType === "text/html" ? "utf-8" : null,
        })
    );
};

export const fsStorage = {
    write,
    read,
    clear,
};
