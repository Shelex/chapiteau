import {
    boolean,
    integer,
    pgTable,
    smallint,
    text,
    timestamp,
    varchar,
} from "drizzle-orm/pg-core";

import { users } from "./users";

export const teams = pgTable("teams", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    name: varchar("name", { length: 50 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
});

export type Team = typeof teams.$inferSelect;

export const teamMembers = pgTable("team_members", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
        .references(() => users.id)
        .notNull(),
    teamId: text("team_id")
        .references(() => teams.id)
        .notNull(),
    isAdmin: boolean("is_admin").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
});

export type TeamMember = typeof teamMembers.$inferSelect;

export const apiKeys = pgTable("api_keys", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    name: varchar("name", { length: 50 }).notNull(),
    expireAt: timestamp("expire_at", { withTimezone: true }).notNull(),
    token: text("token")
        .notNull()
        .$defaultFn(() => crypto.randomUUID()),
    teamId: text("team_id")
        .references(() => teams.id)
        .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    createdBy: text("created_by").notNull(),
});

export type ApiKey = typeof apiKeys.$inferSelect;

export const invites = pgTable("invites", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    teamId: text("team_id")
        .references(() => teams.id)
        .notNull(),
    expireAt: timestamp("expire_at", { withTimezone: true }).notNull(),
    token: text("token")
        .notNull()
        .$defaultFn(() => crypto.randomUUID()),
    limit: smallint("limit").notNull().default(1),
    count: smallint("count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    createdBy: text("created_by").notNull(),
    active: boolean("active").notNull().default(false),
});

export type Invite = typeof invites.$inferSelect;

export const projects = pgTable("projects", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    name: varchar("name", { length: 50 }).notNull(),
    teamId: text("team_id")
        .references(() => teams.id)
        .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
});

export type Project = typeof projects.$inferSelect;

export const runs = pgTable("runs", {
    id: text("id").primaryKey().notNull(),
    projectId: text("project_id")
        .references(() => projects.id)
        .notNull(),
    numericId: integer("numeric_id").notNull(),
    workers: smallint("workers").notNull().default(0),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
    finishedAt: timestamp("finished_at", { withTimezone: true }).notNull(),
    duration: integer("duration").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    createdBy: text("created_by").notNull(),
    reportUrl: text("report_url"),
    buildName: text("build_name"),
    buildUrl: text("build_url"),
    total: smallint("total").notNull().default(0),
    expected: smallint("expected").notNull().default(0),
    unexpected: smallint("unexpected").notNull().default(0),
    flaky: smallint("flaky").notNull().default(0),
    skipped: smallint("skipped").notNull().default(0),
    ok: boolean("ok").notNull().default(false),
});

export type Run = typeof runs.$inferSelect;

export const files = pgTable("files", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    projectId: text("project_id")
        .references(() => projects.id)
        .notNull(),
    runId: text("run_id")
        .references(() => runs.id)
        .notNull(),
    name: text("name"),
    fileId: text("file_id"),
    total: smallint("total").notNull().default(0),
    expected: smallint("expected").notNull().default(0),
    unexpected: smallint("unexpected").notNull().default(0),
    flaky: smallint("flaky").notNull().default(0),
    skipped: smallint("skipped").notNull().default(0),
    ok: boolean("ok").notNull().default(false),
});

export type File = typeof files.$inferSelect;

export const tests = pgTable("tests", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    projectId: text("project_id")
        .references(() => projects.id)
        .notNull(),
    runId: text("run_id")
        .references(() => runs.id)
        .notNull(),
    fileId: text("file_id")
        .references(() => files.id)
        .notNull(),
    location: text("location"),
    testId: text("test_id"),
    title: text("title"),
    pwProjectName: text("pw_project_name"),
    duration: integer("duration").notNull().default(0),
    outcome: text("outcome").notNull(),
    path: text("path").notNull(),
});

export type Test = typeof tests.$inferSelect;

export const testAttachments = pgTable("test_attachments", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    projectId: text("project_id")
        .references(() => projects.id)
        .notNull(),
    runId: text("run_id")
        .references(() => runs.id)
        .notNull(),
    testId: text("test_id")
        .references(() => tests.id)
        .notNull(),
    attempt: smallint("attempt").notNull().default(0),
    name: text("name"),
    contentType: text("content_type"),
    path: text("path").notNull(),
});

export type TestAttachment = typeof testAttachments.$inferSelect;
