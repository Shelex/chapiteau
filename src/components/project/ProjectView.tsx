"use client";
import { Snippet } from "@nextui-org/snippet";

import { env } from "~/env";
import { type Project } from "~/server/db/schema";

interface ProjectProps {
    project: Project;
    totalRuns?: number;
}

export default function ProjectView({ project, totalRuns }: ProjectProps) {
    if (!project) {
        return null;
    }
    return (
        <div className="p-4 text-left">
            <h2 className="text-lg font-semibold">
                Project &quot;{project.name}&quot;
            </h2>
            <p>CreatedAt: {project.createdAt.toLocaleString()}</p>
            <p>Total runs: {totalRuns ?? 0}</p>
            <p>Link for chapiteau CLI:</p>
            <Snippet
                size="sm"
                style={{
                    maxWidth: "100%",
                    overflow: "auto",
                }}
                hideSymbol
            >{`${env.NEXT_PUBLIC_AUTH_URL}/api/teams/${project.teamId}/${project.id}`}</Snippet>
        </div>
    );
}
