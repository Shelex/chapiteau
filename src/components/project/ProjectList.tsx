"use client";
import { Link as LinkComponent, Listbox, ListboxItem } from "@nextui-org/react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

import { type Project, type Team } from "~/server/db/schema";

import ProjectModal from "../modals/ProjectModal";
import DeleteProjectButton from "./DeleteProjectButton";

interface ProjectListProps {
    teamId: Team["id"];
    refreshId: string;
    onChange?: (id: string) => void;
    enabledEdit: boolean;
}

const ProjectList = ({
    teamId,
    refreshId,
    onChange,
    enabledEdit,
}: ProjectListProps) => {
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
                <ListboxItem key={project.id} textValue={project.name}>
                    <div className="flex flex-col w-full h-16">
                        <Link
                            key={project.id}
                            href={`/project/${project.id}`}
                            passHref
                            legacyBehavior
                            prefetch
                        >
                            <LinkComponent className="overflow-x-scroll font-semibold h-full">
                                {project.name}
                            </LinkComponent>
                        </Link>
                        {enabledEdit && (
                            <div className="flex flex-row gap-1">
                                <DeleteProjectButton
                                    teamId={teamId}
                                    project={project}
                                    onDelete={onChange}
                                />
                                <ProjectModal
                                    teamId={teamId}
                                    action="rename"
                                    projectId={project.id}
                                    onChange={onChange}
                                />
                            </div>
                        )}
                    </div>
                </ListboxItem>
            ))}
        </Listbox>
    );
};

export default ProjectList;
