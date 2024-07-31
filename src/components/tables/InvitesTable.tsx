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

import { type Invite, type Team } from "~/server/db/schema";

import CreateInviteModal from "../modals/CreateInviteModal";
import DeleteInvite from "../modals/DeleteInviteModal";

interface InvitesTableProps {
    invites: Invite[];
    team?: Team;
    isAdmin: boolean;
}

const InvitesTable: React.FC<InvitesTableProps> = ({
    invites,
    team,
    isAdmin,
}) => {
    return (
        <div>
            {team && <CreateInviteModal team={team} />}
            <Table title="Invites" isStriped>
                <TableHeader>
                    <TableColumn>ID</TableColumn>
                    <TableColumn>Status</TableColumn>
                    <TableColumn>ExpiresAt</TableColumn>
                    <TableColumn>Invited</TableColumn>
                    <TableColumn>Created At</TableColumn>
                    <TableColumn>Created By</TableColumn>
                    <TableColumn>Actions</TableColumn>
                </TableHeader>
                <TableBody>
                    {invites.map((invite) => (
                        <TableRow key={invite.id}>
                            <TableCell>{invite.id}</TableCell>
                            <TableCell>
                                <Chip
                                    color={invite.active ? "success" : "danger"}
                                >
                                    {invite.active ? "Active" : "Inactive"}
                                </Chip>
                            </TableCell>
                            <TableCell>{invite.expireAt.toLocaleString()}</TableCell>
                            <TableCell>
                                {invite.count}/{invite.limit}
                            </TableCell>
                            <TableCell>
                                {invite.createdAt?.toLocaleString()}
                            </TableCell>
                            <TableCell>{invite?.createdBy}</TableCell>
                            <TableCell>
                                <DeleteInvite
                                    inviteId={invite.id}
                                    isAdmin={isAdmin}
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default InvitesTable;
