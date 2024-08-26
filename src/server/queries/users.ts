"use server";
import { and, eq, inArray } from "drizzle-orm";

import { db } from "~/server/db";
import { type Team, teamMembers, teams } from "~/server/db/schema";
import { type User, users } from "~/server/db/users";

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

export const verifyMembership = async (
    userId?: User["id"],
    teamId?: Team["id"]
) => {
    if (!userId || !teamId) {
        return {
            isMember: false,
            isAdmin: false,
        };
    }

    const [member] = await db
        .select()
        .from(teamMembers)
        .where(
            and(eq(teamMembers.userId, userId), eq(teamMembers.teamId, teamId))
        )
        .limit(1);

    return {
        isMember: !!member,
        isAdmin: !!member?.isAdmin,
    };
};
