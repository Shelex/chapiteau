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
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";

import { type User } from "~/server/db/users";
import { createTeam } from "~/server/queries";

interface CreateTeamModalProps {
    userId: User["id"];
}

const CreateTeamModal = ({ userId }: CreateTeamModalProps) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [teamName, setTeamName] = useState("");

    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    const handleCreateTeam = async () => {
        const created = await createTeam(teamName, userId);
        setTeamName("");
        router.refresh();
        const current = new URLSearchParams(Array.from(searchParams.entries()));
        created && current.set("selectedTeam", created?.id ?? "");
        const search = current.toString();
        const query = search ? `?${search}` : "";
        void router.push(`${pathname}${query}`);
    };

    return (
        <div>
            <Button color="success" onPress={onOpen}>
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
