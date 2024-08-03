import fs from "node:fs";

export const clearFolderRecursively = (path: string) =>
    fs.existsSync(path) &&
    fs.rmdirSync(path, {
        recursive: true,
    });
