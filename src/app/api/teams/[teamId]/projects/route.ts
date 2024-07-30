import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "~/auth";
import { createProject, getProjects, userIsTeamMember } from "~/server/queries";

const createProjectRequestSchema = z.object({
    name: z.string(),
});

export async function POST(
    request: NextRequest,
    { params }: { params: { teamId: string } }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isMember = await userIsTeamMember(session.user.id, params.teamId);
    if (!isMember) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = createProjectRequestSchema.parse(await request.json());

    if (!params.teamId) {
        return NextResponse.json(
            {
                error: `Invalid url: missing team id`,
            },
            { status: 400 }
        );
    }

    const { name } = body;

    const project = await createProject(name, params.teamId);

    revalidateTag("projects");

    return NextResponse.json(project);
}

export async function GET(
    _: NextRequest,
    { params }: { params: { teamId: string } }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isMember = await userIsTeamMember(session.user.id, params.teamId);
    if (!isMember) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!params.teamId) {
        return NextResponse.json(
            { error: "Invalid url: missing team id" },
            { status: 400 }
        );
    }

    const teams = await getProjects(params.teamId);
    return NextResponse.json(teams);
}
