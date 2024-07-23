"use client";
import React, { useCallback, useState } from "react";
import { type User } from "~/server/db/users";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useRouter } from "next/navigation";

interface CreateTeamModalProps {
    userId: User["id"];
}

const CreateTeamModal = ({ userId }: CreateTeamModalProps) => {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [teamName, setTeamName] = useState("");

    const handleCreateTeam = useCallback(async () => {
        const response = await fetch("/api/teams", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: teamName, userId }),
        });

        if (response.ok) {
            setIsOpen(false);
            router.refresh();
            return;
        }

        const error = await response.text();
        console.error(error);
    }, [router, teamName, userId]);

    return (
        <div>
            <Button onClick={() => setIsOpen(true)}>+ Add Team</Button>
            {isOpen && (
                <div className="modal">
                    <h2>Create New Team</h2>
                    <Input
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        placeholder="Team Name"
                    />
                    <Button onClick={handleCreateTeam}>Create</Button>
                    <Button onClick={() => setIsOpen(false)}>Close</Button>
                </div>
            )}
        </div>
    );
};

export default CreateTeamModal;
