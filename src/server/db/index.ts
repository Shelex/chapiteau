import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "~/env";
import * as schema from "./schema";
import * as users from "./users";

const client = postgres(env.DATABASE_URL);

export const db = drizzle(client, {
    logger: true,
    schema: { ...schema, ...users },
});
