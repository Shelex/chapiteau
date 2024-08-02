"use client";
import {
    Snippet,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
} from "@nextui-org/react";
import React from "react";

import { type ApiKey, type Team } from "~/server/db/schema";

import ApiKeyModal from "../modals/ApiKeyModal";
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
    const [newToken, setNewToken] = React.useState<string | null>(null);

    return (
        <div>
            {team && (
                <div className="m-2 float-end">
                    <ApiKeyModal
                        team={team}
                        action="create"
                        onChange={setNewToken}
                    />
                </div>
            )}
            {newToken && (
                <div className="flex flex-row justify-center">
                    <p>Please copy your api key:</p>
                    <Snippet color="success" hideSymbol>
                        {newToken}
                    </Snippet>
                </div>
            )}
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
                            <TableCell className="w-4/12">
                                {apiKey.name}
                            </TableCell>
                            <TableCell className="w-3/12">
                                {apiKey.expireAt.toLocaleString()}
                            </TableCell>
                            <TableCell className="w-3/12">
                                {apiKey.createdAt?.toLocaleString()}
                            </TableCell>
                            <TableCell className="w-1/12">
                                {apiKey.createdBy}
                            </TableCell>
                            <TableCell className="w-1/12">
                                <div className="flex flex-row flex-wrap gap-1">
                                    {!!team && (
                                        <ApiKeyModal
                                            team={team}
                                            action="edit"
                                            apiKey={apiKey}
                                        />
                                    )}
                                    <DeleteApiKey
                                        keyId={apiKey.id}
                                        isAdmin={isAdmin}
                                    />
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default ApiKeysTable;
