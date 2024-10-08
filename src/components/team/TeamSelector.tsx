"use client";
import { Listbox, type SharedSelection } from "@nextui-org/react";
import { Select, SelectItem } from "@nextui-org/select";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

import { type Team } from "~/server/db/schema";

interface TeamSelectorProps {
    current?: Team["id"];
    onChangedTeam?: (teamId: string) => void;
}

const TeamSelector = ({ current, onChangedTeam }: TeamSelectorProps) => {
    const [teams, setTeams] = useState<Team[]>([]);
    const router = useRouter();

    useEffect(() => {
        const fetchTeams = () =>
            fetch(`/api/teams`, { method: "GET" })
                .then((res) => res.json() as Promise<Team[]>)
                .then((teams) => {
                    const team =
                        localStorage.getItem("selectedTeam") ??
                        teams?.at(0)?.id ??
                        "";

                    onChangedTeam?.(team);
                    setTeams(teams);
                });

        void fetchTeams();
    }, [current, onChangedTeam]);

    const onSelect = (selection: SharedSelection) => {
        const value = selection.currentKey?.trim();
        localStorage.setItem("selectedTeam", value ?? "");
        onChangedTeam?.(value ?? "");
        router.push("/");
    };

    return (
        <div>
            {!teams.length ? (
                <Listbox emptyContent="No teams.">{[]}</Listbox>
            ) : (
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
            )}
        </div>
    );
};

export default TeamSelector;
