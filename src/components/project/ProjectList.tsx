"use client";
import { Link as LinkComponent, Listbox, ListboxItem } from "@nextui-org/react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

import { type Project, type Team } from "~/server/db/schema";

interface ProjectListProps {
    teamId: Team["id"];
    refreshId: string;
}

const ProjectList = ({ teamId, refreshId }: ProjectListProps) => {
    const [projects, setProjects] = useState<Project[]>([]);

    useEffect(() => {
        const fetchProjects = () =>
            fetch(`/api/teams/${teamId}/projects`, { method: "GET" })
                .then((res) => res.json() as Promise<Project[]>)
                .then(
                    (projects) =>
                        Array.isArray(projects) && setProjects(projects)
                );

        teamId && void fetchProjects();
    }, [teamId, refreshId]);

    return (
        <Listbox emptyContent="No projects.">
            {projects.map((project) => (
                <ListboxItem key={project.id}>
                    <Link
                        key={project.id}
                        href={`/project/${project.id}`}
                        passHref
                        legacyBehavior
                        prefetch
                    >
                        <LinkComponent style={{ width: "100%" }}>
                            {project.name}
                        </LinkComponent>
                    </Link>
                </ListboxItem>
            ))}
        </Listbox>
    );
};

export default ProjectList;
