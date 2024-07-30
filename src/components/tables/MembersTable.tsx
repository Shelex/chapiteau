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
import React from "react";

import { type Team } from "~/server/db/schema";

interface MembersTableProps {
    team: Team;
    isAdmin: boolean;
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
}

const TeamMembersTable: React.FC<MembersTableProps> = ({
    team,
    members,
    isAdmin,
}) => {
    return (
        <div>
            <Table title="Members" isStriped>
                <TableHeader>
                    <TableColumn>Name</TableColumn>
                    <TableColumn>Email</TableColumn>
                    <TableColumn>Status</TableColumn>
                    <TableColumn>Added At</TableColumn>
                </TableHeader>
                <TableBody>
                    {members.map(({ user, member }) => (
                        <TableRow key={user?.id}>
                            <TableCell>{user?.name}</TableCell>
                            <TableCell>{user?.email}</TableCell>
                            <TableCell>
                                <Chip
                                    color={
                                        member.isAdmin ? "success" : "secondary"
                                    }
                                >
                                    {member.isAdmin ? "Admin" : "User"}
                                </Chip>
                            </TableCell>
                            <TableCell>
                                {member?.createdAt?.toString()}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default TeamMembersTable;
