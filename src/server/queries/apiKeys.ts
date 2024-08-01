"use server"
import { eq } from "drizzle-orm";

import { auth } from "~/auth";
import { isUuid } from "~/lib/utils";

import { db } from "../db";
import { apiKeys } from "../db/schema";

interface ApiKeyInput {
    name: string;
    teamId: string;
    expireAt: Date;
}

export const createApiKey = async (apiKey: ApiKeyInput) => {
    const session = await auth();
    if (!session?.user?.id) {
        return;
    }

    const createdBy =
        session.user.name ?? session.user.email ?? session.user.id;
    const expireAt = new Date(apiKey.expireAt);
    const [created] = await db
        .insert(apiKeys)
        .values({
            name: apiKey.name,
            teamId: apiKey.teamId,
            createdBy: createdBy,
            expireAt: expireAt,
        })
        .returning();

    return created;
};

export const getApiKeys = async (teamId: string) => {
    const keys = await db
        .select()
        .from(apiKeys)
        .where(eq(apiKeys.teamId, teamId));

    return keys.map((key) => ({
        id: key.id,
        name: key.name,
        expireAt: key.expireAt,
        createdAt: key.createdAt,
        createdBy: key.createdBy,
    }));
};

export const deleteApiKey = async (id: string) => {
    return await db.delete(apiKeys).where(eq(apiKeys.id, id)).returning();
};

export const validateApiKey = async (token: string, teamId: string) => {
    const result = {
        isValid: false,
        apiKeyName: "",
    };

    if (!isUuid(token)) {
        return result;
    }

    const [apiKey] = await db
        .select()
        .from(apiKeys)
        .where(eq(apiKeys.token, token))
        .limit(1);
    if (!apiKey) {
        return result;
    }

    if (!apiKey?.expireAt) {
        return result;
    }

    if (apiKey.teamId !== teamId) {
        return result;
    }

    if (apiKey.expireAt < new Date()) {
        return result;
    }

    return { isValid: true, apiKeyName: apiKey.name };
};
