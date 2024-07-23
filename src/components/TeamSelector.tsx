"use client";
import dynamic from "next/dynamic";
import React, { useState } from "react";
const ProjectList = dynamic(() => import("./ProjectList"), {
    loading: () => <p>Loading projects...</p>,
});
import CreateProjectModal from "./CreateProjectModal";
import { type Team } from "~/server/db/schema";
import { SelectTeam } from "./molecules/team-select";
import { Button } from "./ui/button";
import CreateApiKeyModal from "./CreateApiKeyModal";

interface TeamSelectorProps {
    teams: Team[];
}

const TeamSelector = ({ teams = [] }: TeamSelectorProps) => {
    const [selectedTeam, setSelectedTeam] = useState(teams?.at(0) ?? undefined);
    const [isProjectModalOpen, setProjectModalOpen] = useState(false);

    const handleSelect = (team: Team) => setSelectedTeam(team);

    return (
        <div>
            <SelectTeam
                teams={teams}
                onSelect={handleSelect}
                selected={selectedTeam}
            />
            <Button onClick={() => setProjectModalOpen(true)}>
                + Add Project
            </Button>
            {selectedTeam && <CreateApiKeyModal team={selectedTeam} />}

            <div className="flex flex-col bg-gray-100 rounded-md">
                <div className="p-4 font-bold bg-gray-200 rounded-t-md">
                    Projects
                </div>
                {selectedTeam && <ProjectList teamId={selectedTeam.id} />}
            </div>
            {selectedTeam && (
                <CreateProjectModal
                    isOpen={isProjectModalOpen}
                    onClose={() => setProjectModalOpen(false)}
                    teamId={selectedTeam.id}
                />
            )}
        </div>
    );
};

export default TeamSelector;
