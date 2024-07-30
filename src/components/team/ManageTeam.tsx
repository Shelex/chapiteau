import React from "react";

import TeamMembersTabs from "~/components/team/MembersTabs";
import { type Team } from "~/server/db/schema";
import { getApiKeys, getInvites, getTeamMembers } from "~/server/queries";

interface ManageTeamProps {
    team: Team;
    isAdmin: boolean;
}

const ManageTeam: React.FC<ManageTeamProps> = async ({ team, isAdmin }) => {
    const [members, apiKeys, invites] = await Promise.all([
        getTeamMembers(team.id),
        getApiKeys(team.id),
        getInvites(team.id),
    ]);

    return (
        <div>
            <h1>Team &quot;{team.name}&quot;</h1>
            <TeamMembersTabs
                team={team}
                members={members}
                apiKeys={apiKeys}
                invites={invites}
                isAdmin={isAdmin}
            />
        </div>
    );
};

export default ManageTeam;
