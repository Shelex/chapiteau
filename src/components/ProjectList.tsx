import React from "react";
import { type Team } from "~/server/db/schema";
import { Button } from "@nextui-org/button";
import Link from "next/link";
import { getProjects } from "~/server/queries";

interface ProjectListProps {
    teamId: Team["id"];
}

const ProjectList = async ({ teamId }: ProjectListProps) => {
    const projects = await getProjects(teamId);

    return projects.map((project) => (
        <p key={project.id}>
            <Link href={`/project/${project.id}`} legacyBehavior passHref>
                <Button>{project.name}</Button>
            </Link>
        </p>
    ));
};

export default ProjectList;
