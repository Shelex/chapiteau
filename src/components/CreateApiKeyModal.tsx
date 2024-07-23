"use client";
import React, { useCallback, useState } from "react";
import { type Team } from "~/server/db/schema";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface CreateApiKeyModalProps {
    team: Team;
}

const CreateApiKeyModal = ({ team }: CreateApiKeyModalProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [keyName, setKeyName] = useState("");
    const [expireAt, setExpireAt] = useState(Date.now());
    const [token, setToken] = useState("");

    const handleCreateApiKey = useCallback(async () => {
        const response = await fetch(`/api/teams/${team.id}/tokens`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: keyName,
                teamId: team.id,
                expireAt,
            }),
        });

        if (response.ok) {
            const body = (await response.json()) as { token: string };
            setToken(body.token);
            setIsOpen(false);
            return;
        }

        const error = await response.text();
        console.error(error);
    }, [expireAt, keyName, team]);

    return (
        <div>
            <Button onClick={() => setIsOpen(true)}>
                + Add Api Key for {team.name}
            </Button>
            {token && (
                <>
                    <p>Please copy your api key:</p>
                    <code>{token}</code>
                </>
            )}
            {isOpen && (
                <div className="modal">
                    <h2>Create New Api Key</h2>

                    <Input
                        value={keyName}
                        onChange={(e) => setKeyName(e.target.value)}
                        placeholder="Api Key Name"
                    />
                    <Input
                        value={expireAt}
                        onChange={(e) => setExpireAt(Number(e.target.value))}
                        placeholder="Expire At"
                    />
                    <Button onClick={handleCreateApiKey}>Create</Button>
                    <Button onClick={() => setIsOpen(false)}>Close</Button>
                </div>
            )}
        </div>
    );
};

export default CreateApiKeyModal;
