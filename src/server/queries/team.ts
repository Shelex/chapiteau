"use server";
import { and, desc, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { db } from "../db";
import { type Team, teamMembers, teams } from "../db/schema";
import { type User, users } from "../db/users";

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
