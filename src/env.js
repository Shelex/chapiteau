import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
    /**
     * Specify your server-side environment variables schema here. This way you can ensure the app
     * isn't built with invalid env vars.
     */
    server: {
        DATABASE_URL: z.string().url(),
        NODE_ENV: z
            .enum(["development", "test", "production"])
            .default("development"),
        AUTH_SECRET:
            process.env.NODE_ENV === "production"
                ? z.string()
                : z.string().optional(),
        AUTH_URL: z.preprocess(
            // This makes Vercel deployments not fail if you don't set NEXTAUTH_URL
            // Since NextAuth.js automatically uses the VERCEL_URL if present.
            (str) => process.env.VERCEL_URL ?? str,
            // VERCEL_URL doesn't include `https` so it cant be validated as a URL
            process.env.VERCEL ? z.string() : z.string().url()
        ),
        AUTH_GITHUB_ID: z.string(),
        AUTH_GITHUB_SECRET: z.string(),
        REPORT_STORAGE: z.enum(["fs", "s3"]).default("fs"),
        S3_ENDPOINT: z.string().optional(),
        S3_BUCKET: z.string().optional(),
        S3_ACCESS_KEY: z.string().optional(),
        S3_SECRET_KEY: z.string().optional(),
        S3_REGION: z.string().optional(),
        S3_PORT: z.number().optional(),
    },

    /**
     * Specify your client-side environment variables schema here. This way you can ensure the app
     * isn't built with invalid env vars. To expose them to the client, prefix them with
     * `NEXT_PUBLIC_`.
     */
    client: {
        NEXT_PUBLIC_AUTH_URL: z.string().url(),
    },

    /**
     * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
     * middlewares) or client-side so we need to destruct manually.
     */
    runtimeEnv: {
        DATABASE_URL: process.env.DATABASE_URL,
        NODE_ENV: process.env.NODE_ENV,
        AUTH_SECRET: process.env.AUTH_SECRET,
        NEXT_PUBLIC_AUTH_URL: process.env.NEXT_PUBLIC_AUTH_URL,
        AUTH_URL: process.env.NEXT_PUBLIC_AUTH_URL,
        AUTH_GITHUB_ID: process.env.AUTH_GITHUB_ID,
        AUTH_GITHUB_SECRET: process.env.AUTH_GITHUB_SECRET,
        REPORT_STORAGE: process.env.REPORT_STORAGE,
        S3_ENDPOINT: process.env.S3_ENDPOINT,
        S3_BUCKET: process.env.S3_BUCKET,
        S3_ACCESS_KEY: process.env.S3_ACCESS_KEY,
        S3_SECRET_KEY: process.env.S3_SECRET_KEY,
        S3_REGION: process.env.S3_REGION,
        S3_PORT: process.env.S3_PORT,
    },
    /**
     * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
     * useful for Docker builds.
     */
    skipValidation: !!process.env.SKIP_ENV_VALIDATION,
    /**
     * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
     * `SOME_VAR=''` will throw an error.
     */
    emptyStringAsUndefined: true,
});
