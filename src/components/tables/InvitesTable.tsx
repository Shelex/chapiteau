"use client";
import {
    Chip,
    Snippet,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
} from "@nextui-org/react";
import React, { useState } from "react";

import { env } from "~/env";
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
    const [created, setCreated] = useState("");
    return (
        <div>
            {team && (
                <div className="m-2 float-end h-10">
                    <CreateInviteModal
                        team={team}
                        onCreated={setCreated}
                        isAdmin={isAdmin}
                    />
                </div>
            )}
            {created && !!team && (
                <>
                    <p>
                        Please share this url with members you want to invite:
                    </p>
                    <Snippet
                        color="success"
                        size="sm"
                        hideSymbol
                    >{`${env.NEXT_PUBLIC_AUTH_URL}/api/teams/${team?.id}/invite/${created}`}</Snippet>
                </>
            )}
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
                            <TableCell className="w-3/12">
                                {invite.id}
                            </TableCell>
                            <TableCell className="w-1/12">
                                <Chip
                                    color={invite.active ? "success" : "danger"}
                                >
                                    {invite.active ? "Active" : "Inactive"}
                                </Chip>
                            </TableCell>
                            <TableCell className="w-2/12">
                                {invite.expireAt.toLocaleString()}
                            </TableCell>
                            <TableCell className="w-1/12">
                                {invite.count}/{invite.limit}
                            </TableCell>
                            <TableCell className="w-2/12">
                                {invite.createdAt?.toLocaleString()}
                            </TableCell>
                            <TableCell>{invite?.createdBy}</TableCell>
                            <TableCell className="w-1/12">
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
