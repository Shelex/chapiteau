"use server";
import { asc, count, desc, eq } from "drizzle-orm";

import { auth } from "~/auth";

import { db } from "../db";
import {
    files,
    type Project,
    projects,
    runs,
    type Team,
    testAttachments,
    tests,
} from "../db/schema";
import { clearFolderRecursively } from "./fs";
import { verifyMembership } from "./users";

export const createProject = async (name: string, teamId: string) => {
    const [project] = await db
        .insert(projects)
        .values({
            name,
            teamId,
        })
        .returning();
    return project;
};

export const renameProject = async (name: string, projectId?: string) => {
    if (!projectId) {
        return null;
    }
    const [project] = await db
        .update(projects)
        .set({
            name,
        })
        .where(eq(projects.id, projectId))
        .returning();
    return project;
};

export const getProjects = async (teamId: Team["id"]) => {
    return await db
        .select()
        .from(projects)
        .where(eq(projects.teamId, teamId))
        .orderBy(asc(projects.createdAt));
};

export const getProjectDashboard = async (
    projectId: Project["id"],
    limit = 20,
    offset = 0
) => {
    const [project] = await db
        .select()
        .from(projects)
        .where(eq(projects.id, projectId))
        .limit(1);

    const projectRuns = await db
        .select()
        .from(runs)
        .where(eq(runs.projectId, projectId))
        .orderBy(desc(runs.createdAt))
        .limit(limit)
        .offset(offset);

    const [runsCount] = await db
        .select({ count: count() })
        .from(runs)
        .where(eq(runs.projectId, projectId));

    return {
        project: project,
        runs: projectRuns,
        total: runsCount?.count ?? 0,
    };
};

export const deleteProject = async (
    teamId: Team["id"],
    projectId: Project["id"],
    userIsAdmin?: boolean
) => {
    if (userIsAdmin === undefined) {
        const session = await auth();
        const { isAdmin } = await verifyMembership(session?.user?.id, teamId);
        userIsAdmin = isAdmin;
    }

    if (!userIsAdmin) {
        return { error: "Unauthorized" };
    }

    const [project] = await db
        .select()
        .from(projects)
        .where(eq(projects.id, projectId));

    if (!project) {
        return {
            error: "Project not found",
        };
    }

    await db.transaction(async (tx) => {
        await tx
            .delete(testAttachments)
            .where(eq(testAttachments.projectId, projectId));
        await tx.delete(tests).where(eq(tests.projectId, projectId));
        await tx.delete(files).where(eq(files.projectId, projectId));
        await tx.delete(runs).where(eq(runs.projectId, projectId));
        await tx.delete(projects).where(eq(projects.id, projectId));
        // clear reports
        const path = `${process.cwd()}/reports/${project?.teamId}/${
            project?.id
        }`;
        clearFolderRecursively(path);
    });
};
