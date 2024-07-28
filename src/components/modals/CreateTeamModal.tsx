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
import { useRouter } from "next/navigation";
import React, { useCallback, useState } from "react";

import { type User } from "~/server/db/users";

interface CreateTeamModalProps {
    userId: User["id"];
}

const CreateTeamModal = ({ userId }: CreateTeamModalProps) => {
    const router = useRouter();
    const [teamName, setTeamName] = useState("");

    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    const handleCreateTeam = useCallback(async () => {
        const response = await fetch("/api/teams", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: teamName, userId }),
        });

        if (response.ok) {
            router.refresh();
            return;
        }

        const error = await response.text();
        console.error(error);
    }, [router, teamName, userId]);

    return (
        <div>
            <Button color="success" onPress={onOpen}>+ Add Team</Button>
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
                                        setTeamName(e.target.value)
                                    }
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
