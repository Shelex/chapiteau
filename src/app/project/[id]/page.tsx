import { redirect } from "next/navigation";
import { auth } from "~/auth";
import dynamic from "next/dynamic";
const Project = dynamic(() => import("~/components/Project"), {
    ssr: false,
    loading: () => <p>Loading project...</p>,
});
import { getProjectDashboard } from "~/server/queries";
import { RunsChart } from "~/components/Chart";
import Link from "next/link";
import { Button } from "~/components/ui/button";

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
            <div className="mt-10">
                <h2 className="text-xl font-bold">Runs</h2>
                {runs?.length > 1 && <RunsChart runs={runs} />}
                <ul>
                    {runs.map((run) => (
                        <li key={run.id}>
                            <h4 className="text-xl font-bold">{run.id}</h4>
                            {run.reportUrl && (
                                <Link href={run.reportUrl}>
                                    <Button>Open Report</Button>
                                </Link>
                            )}
                            <pre>{JSON.stringify(run, null, 2)}</pre>
                        </li>
                    ))}
                </ul>
            </div>
        </main>
    );
}
