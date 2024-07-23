"use client";
import React, { useEffect } from "react";
import { type Project, type Team } from "~/server/db/schema";
import { Button } from "./ui/button";
import Link from "next/link";

interface ProjectListProps {
    teamId: Team["id"];
}

const ProjectList = ({ teamId }: ProjectListProps) => {
    const [projects, setProjects] = React.useState<Project[]>([]);

    useEffect(() => {
        const fetchProjects = async () => {
            const response = await fetch(`/api/teams/${teamId}/projects`);
            return response.json();
        };

        fetchProjects()
            .then((projects: Project[]) => {
                setProjects(projects);
            })
            .catch((e) => console.error(e));
    }, [projects.length, teamId]);

    return projects.map((project) => (
        <p key={project.id}>
            <Link href={`/project/${project.id}`} legacyBehavior passHref>
                <Button>{project.name}</Button>
            </Link>
        </p>
    ));
};

export default ProjectList;
