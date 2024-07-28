import { type NextRequest,NextResponse } from "next/server";

import { auth } from "~/auth";
import { deleteRun } from "~/server/queries";

export async function DELETE(
    _: NextRequest,
    { params }: { params: { teamId: string; runId: string } }
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

    if (!params.runId) {
        return NextResponse.json(
            { error: "Invalid url: missing run id" },
            { status: 400 }
        );
    }

    const error = await deleteRun(params.runId, params.teamId);
    if (error) {
        return error;
    }
    return NextResponse.json({
        message: "Run is deleted",
    });
}
