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
    }) => {
        const showSwitch =
            currentAdmin && session.data?.user.id !== teamMember.user?.id;

        return (
            <div className="flex flex-row gap-2 w-24 justify-between">
                {showSwitch ? (
                    <Switch
                        className="min-w-24"
                        color="primary"
                        checked={teamMember.member.isAdmin}
                        onCheckedChange={async (checked) => {
                            await changeAdminStatus(
                                teamMember.user?.id ?? "",
                                checked
                            );
                            router.refresh();
                        }}
                        checkeditem={<p className="ml-5 w-8">Admin</p>}
                        uncheckeditem={
                            <p className="text-white ml-4 text-right">User</p>
                        }
                    />
                ) : (
                    <Chip
                        className="min-w-24 text-center"
                        color={
                            teamMember.member.isAdmin ? "success" : "secondary"
                        }
                    >
                        {teamMember.member.isAdmin ? "Admin" : "User"}
                    </Chip>
                )}
            </div>
        );
    };

    return (
        <div>
            <Table title="Members" isStriped className="mt-14">
                <TableHeader>
                    <TableColumn>Name</TableColumn>
                    <TableColumn>Email</TableColumn>
                    <TableColumn>isAdmin</TableColumn>
                    <TableColumn>Added At</TableColumn>
                </TableHeader>
                <TableBody>
                    {members.map(({ user, member }) => (
                        <TableRow key={user?.id}>
                            <TableCell className="w-3/12">{user?.name}</TableCell>
                            <TableCell className="w-4/12">{user?.email}</TableCell>
                            <TableCell className="w-1/12">
                                <Status
                                    teamMember={{ user, member }}
                                    currentAdmin={isAdmin}
                                />
                            </TableCell>
                            <TableCell className="w-2/12">
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
