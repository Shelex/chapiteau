import { NextResponse, type NextRequest } from "next/server";
import { deleteApiKey } from "~/server/queries";
import { auth } from "~/auth";

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
