import { Client } from "minio";

import { env } from "~/env";
import { withError } from "~/lib";

const createClient = () => {
    const endPoint = env.S3_ENDPOINT;
    const accessKey = env.S3_ACCESS_KEY;
    const secretKey = env.S3_SECRET_KEY;
    const port = env.S3_PORT;
    const region = env.S3_REGION;

    if (!endPoint) {
        throw new Error("S3_ENDPOINT is required");
    }

    if (!accessKey) {
        throw new Error("S3_ACCESS_KEY is required");
    }

    if (!secretKey) {
        throw new Error("S3_SECRET_KEY is required");
    }

    const options = {
        endPoint,
        accessKey,
        secretKey,
        region,
        port,
        useSSL: true,
    };
    console.log("creating Minio client");
    console.log(options);

    const client = new Client(options);

    return client;
};

export class MinioPersist {
    private client: Client;
    private bucket: string;

    constructor() {
        this.client = createClient();
        this.bucket = env.S3_BUCKET ?? "chapiteau-reports";
    }

    private checkBucket = async () => {
        const exist = await this.client.bucketExists(this.bucket);
        if (!exist) {
            await this.client.makeBucket(this.bucket, env.S3_REGION);
        }
    };

    async write(
        teamId: string,
        projectId: string,
        runNumber: number,
        files: File[]
    ) {
        await this.checkBucket();
        for (const file of files) {
            console.log(`writing ${file.name} to minio`);
            const path = `${teamId}/${projectId}/${runNumber}/${file.name}`;
            await this.client.putObject(this.bucket, path, await file.text());
        }
    }

    async read(targetPath: string, contentType?: string | null) {
        console.log(`reading ${targetPath} from minio`);
        await this.checkBucket();
        const { result: stream, error } = await withError(
            this.client.getObject(this.bucket, targetPath)
        );

        if (error ?? !stream) {
            return { result: null, error };
        }

        const readStream = new Promise<{
            content: string | Buffer;
            error: null;
        }>((resolve, reject) => {
            const chunks: Buffer[] = [];

            stream.on("data", (chunk) => {
                chunks.push(chunk);
            });

            stream.on("end", () => {
                const fullContent = Buffer.concat(chunks);
                resolve({ content: fullContent, error: null });
            });

            stream.on("error", (error) => {
                reject({ content: null, error });
            });
        });

        const { result, error: readError } = await withError(readStream);

        return {
            result:
                (contentType === "text/html"
                    ? result?.content.toString("utf-8")
                    : result?.content) ?? null,
            error: error ?? readError ?? result?.error ?? null,
        };
    }

    async clear(path: string) {
        await this.checkBucket();
        console.log(`clearing ${path} from minio`);
        await this.client.removeObject(this.bucket, path, {
            forceDelete: true,
        });
    }
}
