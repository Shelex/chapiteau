"use client";
import {
    Chip,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import React from "react";

import { Switch } from "~/components/ui/switch";
import { type Team } from "~/server/db/schema";
import { changeMemberAdminStatus } from "~/server/queries";

interface Member {
    user: {
        id: string;
        name: string | null;
        email?: string | null;
    } | null;
    member: {
        isAdmin: boolean;
        createdAt: Date;
    };
}

interface MembersTableProps {
    team: Team;
    isAdmin: boolean;
    members: Member[];
}

const TeamMembersTable: React.FC<MembersTableProps> = ({
    team,
    members,
    isAdmin,
}) => {
    const router = useRouter();
    const session = useSession();
    const changeAdminStatus = async (userId: string, newStatus: boolean) => {
        if (!isAdmin) {
            return;
        }
        await changeMemberAdminStatus(team.id, userId, newStatus);
    };

    const Status = ({
        teamMember,
        currentAdmin,
    }: {
        teamMember: Member;
        currentAdmin: boolean;
    }) => (
        <div className="flex flex-row gap-2 w-24 justify-between">
            {currentAdmin && session.data?.user.id !== teamMember.user?.id && (
                <Switch
                    color="primary"
                    checked={teamMember.member.isAdmin}
                    onCheckedChange={async (checked) => {
                        await changeAdminStatus(
                            teamMember.user?.id ?? "",
                            checked
                        );
                        router.refresh();
                    }}
                />
            )}
            <Chip
                className="min-w-20 text-center"
                color={teamMember.member.isAdmin ? "success" : "secondary"}
            >
                {teamMember.member.isAdmin ? "Admin" : "User"}
            </Chip>
        </div>
    );

    return (
        <div>
            <Table title="Members" isStriped>
                <TableHeader>
                    <TableColumn>Name</TableColumn>
                    <TableColumn>Email</TableColumn>
                    <TableColumn>isAdmin</TableColumn>
                    <TableColumn>Added At</TableColumn>
                </TableHeader>
                <TableBody>
                    {members.map(({ user, member }) => (
                        <TableRow key={user?.id}>
                            <TableCell>{user?.name}</TableCell>
                            <TableCell>{user?.email}</TableCell>
                            <TableCell>
                                <Status
                                    teamMember={{ user, member }}
                                    currentAdmin={isAdmin}
                                />
                            </TableCell>
                            <TableCell>
                                {member?.createdAt?.toLocaleString()}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default TeamMembersTable;
