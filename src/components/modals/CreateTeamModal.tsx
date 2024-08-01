"use client";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import {
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    useDisclosure,
} from "@nextui-org/modal";
import React, { useState } from "react";

import { type User } from "~/server/db/users";
import { createTeam } from "~/server/queries";

interface CreateTeamModalProps {
    userId: User["id"];
    onCreated?: (teamId: string) => void;
}

const CreateTeamModal = ({ userId, onCreated }: CreateTeamModalProps) => {
    const [teamName, setTeamName] = useState("");

    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    const handleCreateTeam = async () => {
        // TODO use form
        if (!teamName || teamName?.length > 50) {
            return;
        }
        const created = await createTeam(teamName, userId);
        if (!created) {
            return;
        }
        onCreated?.(created.id);
        setTeamName("");
    };

    return (
        <div>
            <Button className="w-full" color="success" onPress={onOpen}>
                + Add Team
            </Button>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                Create New Team
                            </ModalHeader>
                            <ModalBody>
                                <Input
                                    value={teamName}
                                    onChange={(e) =>
                                        e.target.value &&
                                        setTeamName(e.target.value)
                                    }
                                    validate={(value) => {
                                        if (!value)
                                            return "Team Name is required";
                                        if (value.length > 50)
                                            return "Team Name is too long";
                                        return true
                                    }}
                                    placeholder="Team Name"
                                />
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" onPress={onClose}>
                                    Close
                                </Button>
                                <Button
                                    color="primary"
                                    onPress={onClose}
                                    onClick={handleCreateTeam}
                                >
                                    Create
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
};

export default CreateTeamModal;
