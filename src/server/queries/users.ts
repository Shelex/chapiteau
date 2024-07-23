import { desc, eq, inArray } from "drizzle-orm";
import { db } from "~/server/db";
import { users, type User } from "~/server/db/users";
import {
    type Team,
    teams,
    teamMembers,
    type Project,
    projects,
    runs,
} from "../db/schema";

export const deleteUser = async (id: string) => {
    return await db.delete(users).where(eq(users.id, id)).returning();
};

export const getTeams = async (userId: User["id"]) => {
    const member = await db
        .select({
            id: teamMembers.teamId,
        })
        .from(teamMembers)
        .where(eq(teamMembers.userId, userId));

    const ids = member.map((m) => m.id);

    if (!ids?.length) {
        return [];
    }

    return await db.select().from(teams).where(inArray(teams.id, ids));
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
