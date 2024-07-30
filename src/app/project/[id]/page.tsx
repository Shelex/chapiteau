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
        redirect(`/api/auth/signin?callbackUrl=/project/${params.id}`);
    }

    const { project, runs } = await getProjectDashboard(params.id ?? "");
    const isAdmin = await userIsAdmin(session.user.id, project?.teamId);

    return (
        <div className="text-center">
            {project && <ProjectView project={project} />}
            {project?.teamId && (
                <div>
                    {runs?.length > 1 && <RunsChart runs={runs} />}
                    <ul>
                        <div className="flex flex-row justify-between flex-wrap">
                            {runs.map((run) => (
                                <li key={run.id} className="w-1/2 min-w-max my-4 p-4">
                                    <RunView
                                        teamId={project?.teamId}
                                        run={run}
                                        isAdmin={isAdmin}
                                    />
                                </li>
                            ))}
                        </div>
                    </ul>
                </div>
            )}
        </div>
    );
}
