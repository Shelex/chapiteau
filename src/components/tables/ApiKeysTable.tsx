"use client";
import {
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
} from "@nextui-org/react";
import React from "react";

import { type ApiKey, type Team } from "~/server/db/schema";

import CreateApiKeyModal from "../modals/CreateApiKeyModal";
import DeleteApiKey from "../modals/DeleteApiKeyModal";

interface ApiKeysTableProps {
    apiKeys: Omit<ApiKey, "token" | "teamId">[];
    team?: Team;
    isAdmin: boolean;
}

const ApiKeysTable: React.FC<ApiKeysTableProps> = ({
    apiKeys,
    team,
    isAdmin,
}) => {
    return (
        <div>
            {team && <CreateApiKeyModal team={team} />}
            <Table title="Api Keys" isStriped>
                <TableHeader>
                    <TableColumn>Name</TableColumn>
                    <TableColumn>ExpiresAt</TableColumn>
                    <TableColumn>Created At</TableColumn>
                    <TableColumn>Created By</TableColumn>
                    <TableColumn>Actions</TableColumn>
                </TableHeader>
                <TableBody>
                    {apiKeys.map((apiKey) => (
                        <TableRow key={apiKey.id}>
                            <TableCell>{apiKey.name}</TableCell>
                            <TableCell>{apiKey.expireAt.toString()}</TableCell>
                            <TableCell>
                                {apiKey.createdAt?.toLocaleString()}
                            </TableCell>
                            <TableCell>{apiKey.createdBy}</TableCell>
                            <TableCell>
                                <DeleteApiKey
                                    keyId={apiKey.id}
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

export default ApiKeysTable;
