"use client";
import { Card, CardBody, Tab, Tabs } from "@nextui-org/react";
import React from "react";
import TeamMembersTable from "./members-table";
import ApiKeysTable from "./api-keys-table";
import { type Team, type ApiKey } from "~/server/db/schema";

interface TeamMembersTabsProps {
    team?: Team;
    members: {
        user: {
            id: string;
            name: string | null;
            email: string;
        } | null;
        member: {
            isAdmin: boolean;
            createdAt: Date;
        };
    }[];
    apiKeys: Omit<ApiKey, "token" | "teamId">[];
    isAdmin: boolean;
}

const TeamMembersTabs: React.FC<TeamMembersTabsProps> = ({
    team,
    members,
    apiKeys,
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
                <Card>
                    <CardBody>
                        TODO Excepteur sint occaecat cupidatat non proident,
                        sunt in culpa qui officia deserunt mollit anim id est
                        laborum.
                    </CardBody>
                </Card>
            </Tab>
        </Tabs>
    );
};

export default TeamMembersTabs;
