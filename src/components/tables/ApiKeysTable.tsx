"use client";
import {
    Button,
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

import { type ApiKey,type Team } from "~/server/db/schema";

import CreateApiKeyModal from "../modals/CreateApiKeyModal";

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
                        <TableRow key={apiKey?.id}>
                            <TableCell>{apiKey?.name}</TableCell>
                            <TableCell>{apiKey?.expireAt.toString()}</TableCell>
                            <TableCell>
                                {apiKey?.createdAt?.toString()}
                            </TableCell>
                            <TableCell>{apiKey?.createdBy}</TableCell>
                            <TableCell>
                                <Tooltip
                                    content="Edit Api Key"
                                    isDisabled={!isAdmin}
                                >
                                    <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                                        <Button disabled={!isAdmin}>
                                            <EditIcon />
                                        </Button>
                                    </span>
                                </Tooltip>
                                <Tooltip
                                    isDisabled={!isAdmin}
                                    color="danger"
                                    content="Delete Api Key"
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

export default ApiKeysTable;
