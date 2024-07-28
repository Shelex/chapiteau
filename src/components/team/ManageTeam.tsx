import React from "react";

import TeamMembersTabs from "~/components/team/MembersTabs";
import { getApiKeys, getTeam, getTeamMembers } from "~/server/queries";

interface ManageTeamProps {
    id: string;
    name: string;
    isAdmin: boolean;
}

const ManageTeam: React.FC<ManageTeamProps> = async ({ id, name, isAdmin }) => {
    const team = await getTeam(id);
    const members = await getTeamMembers(id);
    const apiKeys = await getApiKeys(id);

    return (
        <div>
            <h1>Manage Team {name}</h1>
            <TeamMembersTabs
                team={team}
                members={members}
                apiKeys={apiKeys}
                isAdmin={isAdmin}
            />
        </div>
    );
};

export default ManageTeam;