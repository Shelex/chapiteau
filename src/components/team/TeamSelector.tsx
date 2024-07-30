"use client";
import { type SharedSelection } from "@nextui-org/react";
import { Select, SelectItem } from "@nextui-org/select";
import React, { useEffect, useState } from "react";

import { type Team } from "~/server/db/schema";

interface TeamSelectorProps {
    current?: Team["id"];
    onChangedTeam?: (teamId: string) => void;
}

const TeamSelector = ({ current, onChangedTeam }: TeamSelectorProps) => {
    const [teams, setTeams] = useState<Team[]>([]);

    useEffect(() => {
        const fetchTeams = () =>
            fetch(`/api/teams`, { method: "GET" })
                .then((res) => res.json() as Promise<Team[]>)
                .then((teams) => {
                    if (!current) {
                        onChangedTeam?.(teams?.at(0)?.id ?? "");
                    }
                    setTeams(teams);
                });

        void fetchTeams();
    }, [current, onChangedTeam]);

    const onSelect = (selection: SharedSelection) => {
        const value = selection.currentKey?.trim();
        onChangedTeam?.(value ?? "");
    };

    return (
        <div>
            <Select
                label="Select a team"
                onSelectionChange={(selection) => onSelect(selection)}
                selectedKeys={[current ?? ""]}
                fullWidth
                disallowEmptySelection
                classNames={{
                    trigger: "bg-primary-50",
                    listboxWrapper: "min-h-96",
                }}
            >
                {teams.map((team) => (
                    <SelectItem key={team.id}>{team.name}</SelectItem>
                ))}
            </Select>
        </div>
    );
};

export default TeamSelector;
