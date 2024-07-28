import dynamic from "next/dynamic";
import { redirect } from "next/navigation";

import { auth } from "~/auth";
import { RunsChart } from "~/components/charts/RunsChart";
import RunView from "~/components/run/RunView";
import { getProjectDashboard, userIsAdmin } from "~/server/queries";
const ProjectView = dynamic(() => import("~/components/project/ProjectView"), {
    ssr: false,
    loading: () => <p>Loading project...</p>,
});

interface ProjectProps {
    params: { id: string };
}

export default async function ProjectPage({ params }: Readonly<ProjectProps>) {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/api/auth/signin");
    }

    const isAdmin = await userIsAdmin(session.user.id);
    const { project, runs } = await getProjectDashboard(params.id ?? "");

    return (
        <main className="text-center mt-10">
            {project && <ProjectView project={project} />}
            {project?.teamId && (
                <div className="mt-10">
                    {runs?.length > 1 && <RunsChart runs={runs} />}
                    <ul>
                        {runs.map((run) => (
                            <li key={run.id}>
                                <RunView teamId={project?.teamId} run={run} isAdmin={isAdmin} />
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </main>
    );
}
