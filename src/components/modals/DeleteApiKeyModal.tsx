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
import { toast } from "sonner";

import { deleteApiKey as deleteAoiKeyServer } from "~/server/queries";

import { DeleteIcon } from "../icons/DeleteIcon";

interface DeleteApiKeyProps {
    keyId: string;
    isAdmin: boolean;
}

export default function DeleteApiKey({ keyId, isAdmin }: DeleteApiKeyProps) {
    const router = useRouter();

    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    const deleteApiKey = async () => {
        if (!keyId) {
            return;
        }
        const [deleted] = await deleteAoiKeyServer(keyId);
        deleted
            ? toast.success(`Api key ${deleted.name} deleted successfully`)
            : toast.error("Failed to delete api key");

        router.refresh();
    };

    return (
        !!keyId && (
            <>
                <Tooltip
                    color="danger"
                    content="delete api key"
                    placement="left"
                >
                    {isAdmin && (
                        <Button
                            size="sm"
                            color="danger"
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
                                        permanently delete your api key thus it
                                        will be available no more.
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
                                        onClick={deleteApiKey}
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
