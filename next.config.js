/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "avatars.githubusercontent.com",
                port: "",
                pathname: "/u/**",
            },
        ],
    },
    async rewrites() {
        return [
            {
                source: "/reports/:teamId/:projectId/:runId",
                destination: "/api/report/:teamId/:projectId/:runId",
            },
        ];
    },
};

export default config;
