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
import { DeleteIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { deleteApiKey as deleteAoiKeyServer } from "~/server/queries";

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
        await deleteAoiKeyServer(keyId);
        router.refresh();
    };

    return (
        !!keyId && (
            <>
                <Tooltip color="danger" content="Delete Api Key">
                    <Button color="danger" disabled={!isAdmin} onPress={onOpen}>
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
