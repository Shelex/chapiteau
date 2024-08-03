import React from "react";

import TeamMembersTabs from "~/components/team/MembersTabs";
import { type Team } from "~/server/db/schema";
import { getApiKeys, getInvites, getTeamMembers } from "~/server/queries";

import TeamModal from "../modals/TeamModal";
import DeleteTeamButton from "./DeleteTeamButton";

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
            <h1 className="m-2 h-10 flex flex-row gap-2">
                <span className="basis-11/12 md:pl-32">
                    Team &quot;<span className="font-bold">{team.name}</span>
                    &quot;
                </span>
                {isAdmin && (
                    <div className="p-2 flex flex-row items-center gap-2">
                        <TeamModal
                            team={team}
                            action="rename"
                            userId={userId}
                        />
                        <DeleteTeamButton
                            team={team}
                            userId={userId}
                            isAdmin={isAdmin}
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
