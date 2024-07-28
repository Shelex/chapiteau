import dynamic from "next/dynamic";
import { redirect } from "next/navigation";

import { auth } from "~/auth";
import { getTeam, userIsAdmin } from "~/server/queries";
const Team = dynamic(() => import("~/components/team/ManageTeam"), {
    ssr: false,
    loading: () => <p>Loading team members...</p>,
});

interface TeamProps {
    params: { id: string };
}

export default async function TeamPage({ params }: Readonly<TeamProps>) {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/api/auth/signin");
    }

    const team = await getTeam(params.id);

    if (!team) {
        return <p>Team not found</p>;
    }

    const isAdmin = await userIsAdmin(session.user.id, team.id);

    return (
        <main className="text-center mt-10">
            <Team id={team.id} name={team.name} isAdmin={!isAdmin} />
        </main>
    );
}
