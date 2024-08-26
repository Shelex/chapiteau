"use client";
import { Button } from "@nextui-org/button";
import {
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    useDisclosure,
} from "@nextui-org/modal";
import { Input, Tooltip } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { type Team } from "~/server/db/schema";
import { deleteTeam } from "~/server/queries";

import { DeleteIcon } from "../icons/DeleteIcon";

interface DeleteTeamButtonProps {
    team?: Team;
    userId?: string;
    isAdmin?: boolean;
}

export default function DeleteTeamButton({
    team,
    userId,
    isAdmin,
}: DeleteTeamButtonProps) {
    const router = useRouter();
    const [confirm, setConfirm] = useState("");

    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    const DeleteTeam = async () => {
        if (!userId || !team || !isAdmin) {
            return;
        }
        const result = await deleteTeam(userId, team.id);
        if (result?.error) {
            toast.error("Failed to delete team", {
                description: result.error,
            });
            return;
        }
        toast.success(`Request to delete team ${team.name} sent successfully`);
        router.push("/");
        localStorage.removeItem("selectedTeam");
        router.refresh();
    };

    return (
        !!userId &&
        !!team &&
        isAdmin && (
            <>
                <Tooltip color="danger" content="delete team" placement="top">
                    <Button size="sm" color="danger" onPress={onOpen}>
                        <DeleteIcon />
                    </Button>
                </Tooltip>
                <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                    <ModalContent>
                        {(onClose) => (
                            <>
                                <ModalHeader className="flex flex-col gap-1">
                                    Are you absolutely sure?
                                </ModalHeader>
                                <ModalBody>
                                    <p>
                                        This action cannot be undone. This will
                                        permanently delete your team, members,
                                        invites, api keys, projects, runs and
                                        all related data.
                                    </p>
                                    <p>
                                        Please type team name&nbsp;
                                        <strong className="break-all">
                                            {team?.name}
                                        </strong>
                                        &nbsp;to confirm:
                                    </p>
                                    <Input
                                        isRequired
                                        label="Confirm"
                                        value={confirm}
                                        onValueChange={setConfirm}
                                    />
                                </ModalBody>
                                <ModalFooter>
                                    <Button
                                        color="primary"
                                        variant="light"
                                        onPress={onClose}
                                    >
                                        Close
                                    </Button>
                                    <Button
                                        color="danger"
                                        isDisabled={confirm !== team?.name}
                                        onPress={onClose}
                                        onClick={DeleteTeam}
                                    >
                                        Sure, Delete
                                    </Button>
                                </ModalFooter>
                            </>
                        )}
                    </ModalContent>
                </Modal>
            </>
        )
    );
}
