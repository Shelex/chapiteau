import React from "react";

import TeamMembersTabs from "~/components/team/MembersTabs";
import { type Team } from "~/server/db/schema";
import { getApiKeys, getInvites, getTeamMembers } from "~/server/queries";

import TeamModal from "../modals/TeamModal";

interface ManageTeamProps {
    userId: string;
    team: Team;
    isAdmin: boolean;
    onChange?: (id: string) => void;
}

const ManageTeam: React.FC<ManageTeamProps> = async ({
    userId,
    team,
    isAdmin,
}) => {
    const [members, apiKeys, invites] = await Promise.all([
        getTeamMembers(team.id),
        getApiKeys(team.id),
        getInvites(team.id),
    ]);

    return (
        <div>
            <h1 className="m-2 h-10">
                <span className="pl-4">
                    Team &quot;<span className="font-bold">{team.name}</span>
                    &quot;
                </span>
                {isAdmin && (
                    <div className="w-1/12 m-2 float-end">
                        <TeamModal
                            team={team}
                            action="rename"
                            userId={userId}
                        />
                    </div>
                )}
            </h1>
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
