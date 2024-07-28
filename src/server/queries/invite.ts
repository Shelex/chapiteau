"use server";
import { eq } from "drizzle-orm";

import { auth } from "~/auth";
import { isUuid } from "~/lib/utils";

import { db } from "../db";
import { type Invite, invites, teamMembers } from "../db/schema";

interface InviteInput {
    teamId: string;
    expireAt: Date;
    limit: number;
}

export const createInvite = async (invite: InviteInput) => {
    const session = await auth();
    if (!session?.user?.id) {
        return;
    }

    const createdBy =
        session.user.name ?? session.user.email ?? session.user.id;
    const expireAt = new Date(invite.expireAt);

    const [created] = await db
        .insert(invites)
        .values({
            teamId: invite.teamId,
            createdBy: createdBy,
            limit: invite.limit,
            expireAt: expireAt,
            active: true,
        })
        .returning();

    return created;
};

export const getInvites = async (teamId: string) => {
    return await db.select().from(invites).where(eq(invites.teamId, teamId));
};

export const acceptInvite = async (teamId: string, token: string) => {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: "Unauthorized" };
    }

    const { invite, error } = await validateInvite(teamId, token);
    if (error || !invite) {
        return { error };
    }

    await db.transaction(async (tx) => {
        await tx.insert(teamMembers).values({
            teamId,
            userId: session.user.id,
        });

        const invitedMembersCount = invite.count + 1;
        const updateInvite = {
            count: invitedMembersCount,
            active: invite.active ? invitedMembersCount < invite.limit : false,
        };

        await tx
            .update(invites)
            .set(updateInvite)
            .where(eq(invites.id, invite.id));
    });
};

export const setInviteActivity = async (id: string, isActive: boolean) => {
    return await db
        .update(invites)
        .set({ active: isActive })
        .where(eq(invites.id, id))
        .returning();
};

const getInviteByToken = async (token: string) => {
    const [invite] = await db
        .select()
        .from(invites)
        .where(eq(invites.token, token))
        .limit(1);
    return invite;
};

export const validateInvite = async (
    teamId: string,
    token: string
): Promise<{ invite?: Invite; error: string }> => {
    if (!isUuid(token)) {
        return {
            error: "Invalid token",
        };
    }

    const invite = await getInviteByToken(token);

    if (!invite) {
        return {
            error: "invite not found",
        };
    }

    if (invite.teamId !== teamId) {
        return {
            error: "invite not found",
        };
    }

    if (!invite.active) {
        return {
            error: "invite not active",
        };
    }

    if (!invite?.expireAt) {
        return {
            error: "invite has expired",
        };
    }

    if (invite.expireAt < new Date()) {
        await setInviteActivity(invite.id, false);
        return {
            error: "invite has expired",
        };
    }

    if (invite.limit <= invite.count) {
        await setInviteActivity(invite.id, false);
        return {
            error: "invite limit reached",
        };
    }

    return { invite, error: "" };
};
