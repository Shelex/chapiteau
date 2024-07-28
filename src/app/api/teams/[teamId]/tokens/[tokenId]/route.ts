import { type NextRequest,NextResponse } from "next/server";

import { auth } from "~/auth";
import { deleteApiKey } from "~/server/queries";

export async function DELETE(
    _: NextRequest,
    { params }: { params: { teamId: string; tokenId: string } }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!params.tokenId || !params.tokenId) {
        return NextResponse.json(
            { error: "Invalid url: missing team id or token id" },
            { status: 400 }
        );
    }

    await deleteApiKey(params.tokenId);

    return NextResponse.json({ message: "Not implemented" }, { status: 501 });
}
