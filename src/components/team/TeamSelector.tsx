"use client";
import { type SharedSelection } from "@nextui-org/react";
import { Select, SelectItem } from "@nextui-org/select";
import { usePathname, useRouter,useSearchParams } from "next/navigation";
import React from "react";

import { type Team } from "~/server/db/schema";

interface TeamSelectorProps {
    teams: Team[];
    param: string;
    current?: Team["id"];
}

const TeamSelector = ({ teams = [], current, param }: TeamSelectorProps) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const selectedItemId = current ?? searchParams.get(param);

    const onSelect = (selection: SharedSelection) => {
        const current = new URLSearchParams(Array.from(searchParams.entries()));
        const value = selection.currentKey?.trim();

        if (!value) {
            current.delete(param);
        } else {
            current.set(param, value);
        }

        const search = current.toString();
        const query = search ? `?${search}` : "";

        void router.push(`${pathname}${query}`);
    };

    return (
        <div>
            <Select
                label="Select a team"
                onSelectionChange={(selection) => onSelect(selection)}
                selectedKeys={[selectedItemId ?? ""]}
                unselectable="off"
            >
                {teams.map((team) => (
                    <SelectItem key={team.id}>{team.name}</SelectItem>
                ))}
            </Select>
        </div>
    );
};

export default TeamSelector;
