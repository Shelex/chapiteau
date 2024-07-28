"use client";
import {
    Button,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    Tooltip,
} from "@nextui-org/react";
import { DeleteIcon, EditIcon } from "lucide-react";
import React from "react";

import { type Invite, type Team } from "~/server/db/schema";

import CreateInviteModal from "../modals/CreateInviteModal";

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
                            <TableCell>{invite.expireAt.toString()}</TableCell>
                            <TableCell>
                                {invite.count}/{invite.limit}
                            </TableCell>
                            <TableCell>
                                {invite.createdAt?.toString()}
                            </TableCell>
                            <TableCell>{invite?.createdBy}</TableCell>
                            <TableCell>
                                <Tooltip
                                    content="Edit Invite"
                                    color="warning"
                                >
                                    <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                                        <Button disabled={!isAdmin}>
                                            <EditIcon />
                                        </Button>
                                    </span>
                                </Tooltip>
                                <Tooltip
                                    color="danger"
                                    content="Delete Invite"
                                >
                                    <span className="text-lg text-danger cursor-pointer active:opacity-50">
                                        <Button disabled={!isAdmin}>
                                            <DeleteIcon />
                                        </Button>
                                    </span>
                                </Tooltip>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default InvitesTable;
