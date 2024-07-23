"use client";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface CreateProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    teamId: string;
}

const CreateProjectModal = ({
    isOpen,
    onClose,
    teamId,
}: CreateProjectModalProps) => {
    const [projectName, setProjectName] = useState("");

    const handleCreateProject = async () => {
        const response = await fetch(`/api/teams/${teamId}/projects`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: projectName, teamId }),
        });

        if (response.ok) {
            onClose();
            return;
        }

        const error = await response.text();
        console.error(error);
    };

    if (!isOpen) return null;

    return (
        <div className="modal">
            <h2>Create New Project</h2>
            <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Project Name"
            />
            <Button onClick={handleCreateProject}>Create</Button>
            <Button onClick={onClose}>Close</Button>
        </div>
    );
};

export default CreateProjectModal;
