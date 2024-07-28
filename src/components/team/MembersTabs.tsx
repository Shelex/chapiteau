"use client";
import { Tab, Tabs } from "@nextui-org/react";
import React from "react";

import { type ApiKey, type Invite, type Team } from "~/server/db/schema";

import ApiKeysTable from "../tables/ApiKeysTable";
import InvitesTable from "../tables/InvitesTable";
import TeamMembersTable from "../tables/MembersTable";

interface TeamMembersTabsProps {
    team?: Team;
    members: {
        user: {
            id: string;
            name: string | null;
            email?: string | null;
        } | null;
        member: {
            isAdmin: boolean;
            createdAt: Date;
        };
    }[];
    apiKeys: Omit<ApiKey, "token" | "teamId">[];
    invites: Invite[];
    isAdmin: boolean;
}

const TeamMembersTabs: React.FC<TeamMembersTabsProps> = ({
    team,
    members,
    apiKeys,
    invites,
    isAdmin,
}) => {
    return (
        <Tabs aria-label="Options">
            <Tab key="members" title="Members">
                <TeamMembersTable members={members} />
            </Tab>
            <Tab key="api-keys" title="Api Keys">
                <ApiKeysTable team={team} apiKeys={apiKeys} isAdmin={isAdmin} />
            </Tab>
            <Tab key="invites" title="Invites">
                <InvitesTable team={team} invites={invites} isAdmin={isAdmin} />
            </Tab>
        </Tabs>
    );
};

export default TeamMembersTabs;
