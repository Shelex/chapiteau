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
import { Tooltip } from "@nextui-org/react";
import { useRouter } from "next/navigation";

import { deleteInvite as deleteInviteServer } from "~/server/queries";

import { DeleteIcon } from "../icons/DeleteIcon";

interface DeleteInviteProps {
    inviteId: string;
    isAdmin: boolean;
}

export default function DeleteInvite({ inviteId, isAdmin }: DeleteInviteProps) {
    const router = useRouter();

    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    const deleteInvite = async () => {
        if (!inviteId) {
            return;
        }
        await deleteInviteServer(inviteId);
        router.refresh();
    };

    return (
        !!inviteId && (
            <>
                <Tooltip color="danger" content="Delete Invite">
                    {isAdmin && (
                        <Button
                            color="danger"
                            disabled={!isAdmin}
                            onPress={onOpen}
                        >
                            <DeleteIcon />
                        </Button>
                    )}
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
                                        permanently delete your invite data.
                                    </p>
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
                                        onPress={onClose}
                                        onClick={deleteInvite}
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
