import { redirect } from "next/navigation";
import { type NextRequest, NextResponse } from "next/server";

import { auth } from "~/auth";
import { acceptInvite, verifyMembership } from "~/server/queries";

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
        /**
         * You are not able to just redirect a user back to the host
         * https://github.com/vercel/next.js/issues/37536#issuecomment-1160548793
         * Next.js hides real host for security reasons
         * when deployed outside of vercel (surprise-surprise)
         */
        const realHost = req.headers.get("host") ?? "";
        const instanceHost = "localhost:80";

        const callbackUrl = realHost
            ? req.url.replace(instanceHost, realHost)
            : req.url;

        redirect(`/api/auth/signin?callbackUrl=${callbackUrl}`);
    }

    const { teamId, inviteToken } = params;

    const { isMember } = await verifyMembership(session.user.id, params.teamId);

    if (isMember) {
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
