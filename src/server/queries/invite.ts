"use server";
import { desc, eq } from "drizzle-orm";

import { auth } from "~/auth";
import { isUuid } from "~/lib";

import { db } from "../db";
import { type Invite, invites, teamMembers } from "../db/schema";

interface InviteInput {
    teamId: string;
    expireAt: Date;
    limit: number;
    count?: number;
}

const isInviteActive = (invite: InviteInput) => {
    if (!!invite?.count && invite.count >= invite.limit) {
        return false;
    }

    if (invite.expireAt <= new Date()) {
        return false;
    }

    return true;
};

export const createInvite = async (invite: InviteInput) => {
    const session = await auth();
    if (!session?.user?.id) {
        return;
    }

    const createdBy =
        session.user.name ?? session.user.email ?? session.user.id;
    const expireAt = new Date(invite.expireAt);

    const active = isInviteActive(invite);

    const [created] = await db
        .insert(invites)
        .values({
            teamId: invite.teamId,
            createdBy: createdBy,
            limit: invite.limit,
            expireAt: expireAt,
            active,
        })
        .returning();

    return created;
};

export const getInvites = async (teamId: string) => {
    const inviteList = await db
        .select()
        .from(invites)
        .where(eq(invites.teamId, teamId))
        .orderBy(desc(invites.createdAt));

    return inviteList.map((invite) => ({
        ...invite,
        active: isInviteActive(invite),
    }));
};

export const deleteInvite = async (id: string) => {
    return await db.delete(invites).where(eq(invites.id, id));
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

const getInviteByToken = async (token: string) => {
    const [invite] = await db
        .select()
        .from(invites)
        .where(eq(invites.token, token))
        .limit(1);

    if (!invite) {
        return;
    }
    return {
        ...invite,
        active: isInviteActive(invite),
    };
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
        return {
            error: "invite has expired",
        };
    }

    if (invite.limit <= invite.count) {
        return {
            error: "invite limit reached",
        };
    }

    return { invite, error: "" };
};
