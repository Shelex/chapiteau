"use server";
import { and, desc, eq, inArray } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { db } from "~/server/db";
import { type User, users } from "~/server/db/users";

import {
    type Project,
    projects,
    runs,
    type Team,
    teamMembers,
    teams,
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

export const getTeam = async (teamId: Team["id"]) => {
    const [team] = await db
        .select()
        .from(teams)
        .where(eq(teams.id, teamId))
        .limit(1);
    return team;
};

export const getTeamMembers = async (teamId: Team["id"]) => {
    const member = alias(teamMembers, "member");
    return await db
        .select()
        .from(member)
        .where(eq(member.teamId, teamId))
        .leftJoin(users, eq(member.userId, users.id));
};

export const userIsTeamMember = async (
    userId?: User["id"],
    teamId?: Team["id"]
) => {
    if (!userId || !teamId) {
        return false;
    }
    const [member] = await db
        .select({})
        .from(teamMembers)
        .where(
            and(eq(teamMembers.userId, userId), eq(teamMembers.teamId, teamId))
        )
        .limit(1);

    return !!member;
};

export const userIsAdmin = async (userId?: User["id"], teamId?: Team["id"]) => {
    if (!userId || !teamId) {
        return false;
    }

    const [member] = await db
        .select({ isAdmin: teamMembers.isAdmin })
        .from(teamMembers)
        .where(
            and(eq(teamMembers.userId, userId), eq(teamMembers.teamId, teamId))
        )
        .limit(1);

    return !!member?.isAdmin;
};
