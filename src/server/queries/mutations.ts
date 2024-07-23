import { eq } from "drizzle-orm";
import { db } from "../db";
import { apiKeys, projects, teamMembers, teams } from "../db/schema";
import { isUuid } from "~/lib/utils";
import { revalidatePath } from "next/cache";

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

        revalidatePath("/");

        return created;
    });
};

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

interface ApiKeyInput {
    name: string;
    teamId: string;
    createdBy: string;
    expireAt: Date;
}

export const createApiKey = async (apiKey: ApiKeyInput) => {
    return await db
        .insert(apiKeys)
        .values({
            name: apiKey.name,
            teamId: apiKey.teamId,
            createdBy: apiKey.createdBy,
            expireAt: apiKey.expireAt,
        })
        .returning();
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

    const apiKey = await db
        .select()
        .from(apiKeys)
        .where(eq(apiKeys.token, token))
        .limit(1);
    if (!apiKey) {
        return result;
    }

    const found = apiKey.at(0);

    if (!found?.expireAt) {
        return result;
    }

    if (found.teamId !== teamId) {
        return result;
    }

    if (found.expireAt < new Date()) {
        return result;
    }

    return { isValid: true, apiKeyName: found.name };
};