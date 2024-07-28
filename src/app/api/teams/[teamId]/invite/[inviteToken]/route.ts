import { redirect } from "next/navigation";
import { type NextRequest, NextResponse } from "next/server";

import { auth } from "~/auth";
import { userIsTeamMember } from "~/server/queries";
import { acceptInvite } from "~/server/queries";

interface InviteParams {
    teamId: string;
    inviteToken: string;
}

export async function GET(
    req: NextRequest,
    {
        params,
    }: {
        params: InviteParams;
    }
) {
    const session = await auth();
    if (!session?.user?.id) {
        console.log(`GEt INVITE`);
        console.log(`req.url=${req.url}`);
        console.log(`req.nextUrl.href=${req.nextUrl.href}`);
        console.log(`req.nextUrl.host=${req.nextUrl.host}`);
        console.log(`req.nextUrl.hostname=${req.nextUrl.hostname}`);
        console.log(`req.headers.get('host')=${req.headers.get("host")}`);
        console.log(`req.referrer=${req.referrer}`)
        console.log(`req.nextUrl.basePath=${req.nextUrl.basePath}`)
        console.log(`req.nextUrl.origin=${req.nextUrl.origin}`)
        redirect("/api/auth/signin?callbackUrl=" + req.url);
    }

    const { teamId, inviteToken } = params;

    const hasAccess = await userIsTeamMember(session.user.id, params.teamId);

    if (hasAccess) {
        return NextResponse.json(
            { error: "You already have access to the team" },
            { status: 400 }
        );
    }

    const result = await acceptInvite(teamId, inviteToken);
    if (result?.error) {
        return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return redirect("/");
}
