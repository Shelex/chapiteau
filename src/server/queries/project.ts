"use server";
import { desc, eq } from "drizzle-orm";

import { db } from "../db";
import { type Project, projects, runs, type Team } from "../db/schema";

export const createProject = async (name: string, teamId: string) => {
    return await db
        .insert(projects)
        .values({
            name,
            teamId,
        })
        .returning();
};

export const renameProject = async (projectId: string, name: string) => {
    return await db
        .update(projects)
        .set({
            name,
        })
        .where(eq(projects.id, projectId))
        .returning();
};

export const getProjects = async (orgId: Team["id"]) => {
    return await db.select().from(projects).where(eq(projects.teamId, orgId));
};

export const getProjectDashboard = async (projectId: Project["id"]) => {
    const project = (
        await db
            .select()
            .from(projects)
            .where(eq(projects.id, projectId))
            .limit(1)
    ).at(0);

    const projectRuns = await db
        .select()
        .from(runs)
        .where(eq(runs.projectId, projectId))
        .orderBy(desc(runs.createdAt))
        .limit(20);

    return {
        project: project,
        runs: projectRuns,
    };
};
