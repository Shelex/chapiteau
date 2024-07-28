import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "~/auth";
import { createTeam, getTeams } from "~/server/queries";

const createTeamRequestSchema = z.object({
    name: z.string(),
});

export async function POST(request: NextRequest) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = createTeamRequestSchema.parse(await request.json());

    const { name } = body;

    const team = await createTeam(name, session.user.id);

    return NextResponse.json(team);
}

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teams = await getTeams(session.user.id);
    return NextResponse.json(teams);
}

export async function DELETE() {
    //TODO
    return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}
