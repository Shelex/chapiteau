import { redirect } from "next/navigation";
import { auth } from "~/auth";
import CreateTeamModal from "~/components/CreateTeamModal";
import TeamSelector from "~/components/TeamSelector";
import { getTeams } from "~/server/queries";

export default async function Home() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/api/auth/signin");
    }

    const teams = (await getTeams(session?.user.id)) ?? [];

    return (
        <main className="text-center mt-10">
            <div className="flex flex-col bg-gray-100 rounded-md">
                <div className="p-4 font-bold bg-gray-200 rounded-t-md">
                    Teams
                </div>
                <TeamSelector teams={teams} />
            </div>
            <div className="flex flex-col bg-gray-100 rounded-md">
                <div className="p-4 font-bold bg-gray-200 rounded-t-md">
                    Create Team
                </div>
                <CreateTeamModal userId={session?.user?.id} />
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
