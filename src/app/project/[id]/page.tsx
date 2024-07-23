import { redirect } from "next/navigation";
import { auth } from "~/auth";
import dynamic from "next/dynamic";
const Project = dynamic(() => import("~/components/Project"), {
    ssr: false,
    loading: () => <p>Loading project...</p>,
});
import { getProjectDashboard } from "~/server/queries";
import { RunsChart } from "~/components/Chart";
import RunView from "~/components/Run";

interface ProjectProps {
    params: { id: string };
}

export default async function ProjectPage({ params }: Readonly<ProjectProps>) {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/api/auth/signin");
    }

    const { project, runs } = await getProjectDashboard(params.id ?? "");

    return (
        <main className="text-center mt-10">
            {project && <Project project={project} />}
            {project?.teamId && (
                <div className="mt-10">
                    {runs?.length > 1 && <RunsChart runs={runs} />}
                    <ul>
                        {runs.map((run) => (
                            <li key={run.id}>
                                <RunView teamId={project?.teamId} run={run} />
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </main>
    );
}
