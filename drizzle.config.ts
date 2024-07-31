import "./local.env";

import { type Config } from "drizzle-kit";

import { env } from "./src/env";

export default {
    dialect: "postgresql",
    schema: "./src/server/db/*",
    out: "./drizzle",
    dbCredentials: {
        url: env.DATABASE_URL,
    },
    verbose: true,
    strict: true,
} satisfies Config;
