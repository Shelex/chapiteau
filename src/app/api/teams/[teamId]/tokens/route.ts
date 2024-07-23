import { NextResponse, type NextRequest } from "next/server";
import { createApiKey, getApiKeys } from "~/server/queries";
import { z } from "zod";
import { auth } from "~/auth";

const createApiKeyRequestSchema = z.object({
    name: z.string(),
    expireAt: z.number(),
});

export async function POST(
    request: NextRequest,
    { params }: { params: { teamId: string } }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = createApiKeyRequestSchema.parse(await request.json());

    if (!params.teamId) {
        return NextResponse.json(
            {
                error: `Invalid url: missing team id`,
            },
            { status: 400 }
        );
    }

    const { name, expireAt } = body;

    const apiKey = await createApiKey({
        name,
        teamId: params.teamId,
        createdBy: session.user.name ?? session.user.email ?? session.user.id,
        expireAt: new Date(expireAt),
    });

    return NextResponse.json(apiKey?.at(0));
}

export async function GET(
    _: NextRequest,
    { params }: { params: { teamId: string } }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!params.teamId) {
        return NextResponse.json(
            { error: "Invalid url: missing team id" },
            { status: 400 }
        );
    }

    const apiKeys = await getApiKeys(params.teamId);
    return NextResponse.json(apiKeys);
}
