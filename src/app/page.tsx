import { Button } from "@nextui-org/react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "~/auth";
import CreateProjectModal from "~/components/modals/CreateProjectModal";
import CreateTeamModal from "~/components/modals/CreateTeamModal";
import ProjectList from "~/components/project/ProjectList";
import TeamSelector from "~/components/team/TeamSelector";
import { getTeams } from "~/server/queries";

interface HomeProps {
    searchParams?: { selectedTeam?: string };
}

export default async function Home({ searchParams }: Readonly<HomeProps>) {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/api/auth/signin");
    }

    const teams = (await getTeams(session?.user.id)) ?? [];

    const selectedTeam = searchParams?.selectedTeam ?? teams?.at(0)?.id;

    return (
        <main className="text-center mt-10">
            <div className="flex flex-col bg-gray-100 rounded-md">
                <div className="p-4 font-bold bg-gray-200 rounded-t-md">
                    Teams
                </div>
                <CreateTeamModal userId={session?.user?.id} />
                <TeamSelector
                    teams={teams}
                    current={selectedTeam}
                    param="selectedTeam"
                />
                {selectedTeam && (
                    <>
                        <Link
                            href={`/team/${selectedTeam}/`}
                            legacyBehavior
                            passHref
                        >
                            <Button color="secondary">Manage team</Button>
                        </Link>

                        <div className="flex flex-col bg-gray-100 rounded-md">
                            <div className="p-4 font-bold bg-gray-200 rounded-t-md">
                                Projects
                            </div>
                            <ProjectList teamId={selectedTeam} />
                            <CreateProjectModal teamId={selectedTeam} />
                        </div>
                    </>
                )}
            </div>
            <div className="flex flex-col bg-gray-100 rounded-md">
                <div className="p-4 font-bold bg-gray-200 rounded-t-md">
                    Current Session
                </div>
                <pre className="py-6 px-4 whitespace-pre-wrap break-all">
                    {JSON.stringify(session, null, 2)}
                </pre>
            </div>
        </main>
    );
}
