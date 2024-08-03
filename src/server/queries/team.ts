"use server";
import { and, desc, eq, ne } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { db } from "../db";
import { apiKeys, invites, type Team, teamMembers, teams } from "../db/schema";
import { type User, users } from "../db/users";
import { deleteProject, getProjects } from "./project";

export const createTeam = async (name: string, userId: string) => {
    return await db.transaction(async (tx) => {
        const team = await tx
            .insert(teams)
            .values({
                name,
            })
            .returning();

        const created = team.at(0);

        if (!created) {
            return;
        }

        await tx
            .insert(teamMembers)
            .values({
                teamId: created.id,
                userId,
                isAdmin: true,
            })
            .returning();

        return created;
    });
};

export const renameTeam = async (name: string, teamId?: string) => {
    if (!teamId) {
        return;
    }
    const [team] = await db
        .update(teams)
        .set({
            name,
        })
        .where(eq(teams.id, teamId))
        .returning();
    return team;
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
        .leftJoin(users, eq(member.userId, users.id))
        .orderBy(desc(member.createdAt));
};

export const changeMemberAdminStatus = async (
    teamId: Team["id"],
    userId: User["id"],
    isAdmin: boolean
) => {
    await db
        .update(teamMembers)
        .set({
            isAdmin,
        })
        .where(
            and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId))
        )
        .returning();
};

export const leaveTeam = async (
    teamId: Team["id"],
    userId: User["id"],
    isAdmin: boolean
) => {
    if (!teamId || !userId) {
        return { error: "Member not found" };
    }

    // prohibit leaving team if user is the only admin
    if (isAdmin) {
        const [otherAdmin] = await db
            .select({
                id: teamMembers.id,
            })
            .from(teamMembers)
            .where(
                and(
                    eq(teamMembers.teamId, teamId),
                    ne(teamMembers.userId, userId),
                    eq(teamMembers.isAdmin, true)
                )
            )
            .limit(1);

        if (!otherAdmin) {
            return { error: "Cannot leave team as a single admin" };
        }
    }

    await db
        .delete(teamMembers)
        .where(
            and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId))
        );
};

export const deleteTeam = async (userId: User["id"], teamId: Team["id"]) => {
    const [member] = await db
        .select()
        .from(teamMembers)
        .where(
            and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId))
        );

    if (!member) {
        return {
            error: "Member not found",
        };
    }

    if (!member.isAdmin) {
        return {
            error: "Only admin can delete the team",
        };
    }

    return await db.transaction(async (tx) => {
        const projects = await getProjects(teamId);

        for (const project of projects) {
            await deleteProject(teamId, project.id, member.isAdmin);
        }

        await tx.delete(invites).where(eq(invites.teamId, teamId));
        await tx.delete(apiKeys).where(eq(apiKeys.teamId, teamId));
        await tx.delete(teamMembers).where(eq(teamMembers.teamId, teamId));
        await tx.delete(teams).where(eq(teams.id, teamId));
    });
};
