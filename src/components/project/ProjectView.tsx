"use client";
import { Snippet } from "@nextui-org/snippet";

import { env } from "~/env";
import { type Project } from "~/server/db/schema";

interface ProjectProps {
    project: Project;
}

export default function ProjectView({ project }: ProjectProps) {
    if (!project) {
        return null;
    }
    return (
        <div className="p-4">
            <h2 className="text-lg font-semibold">{project.name}</h2>
            <p>Id: {project.id}</p>
            <p>TeamId: {project.teamId}</p>
            <p>CreatedAt: {project.createdAt.toString()}</p>
            <p>Link for chapiteau CLI:</p>
            <Snippet size="sm"
                hideSymbol
            >{`${env.NEXT_PUBLIC_AUTH_URL}/api/teams/${project.teamId}/${project.id}`}</Snippet>
        </div>
    );
}
