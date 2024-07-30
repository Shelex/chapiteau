import { redirect } from "next/navigation";

import { auth } from "~/auth";
import Team from '~/components/team/ManageTeam'
import { getTeam, userIsAdmin } from "~/server/queries";

interface TeamProps {
    params: { id: string };
}

export default async function TeamPage({ params }: Readonly<TeamProps>) {
    const session = await auth();

    if (!session?.user?.id) {
        const callbackUrl = `/team/${params.id}`;
        redirect(`/api/auth/signin?callbackUrl=${callbackUrl}`);
    }

    const team = await getTeam(params.id);

    if (!team) {
        return <p>Team not found</p>;
    }

    const isAdmin = await userIsAdmin(session.user.id, team.id);

    return (
        <div className="text-center">
            <Team team={team} isAdmin={!isAdmin} />
        </div>
    );
}
