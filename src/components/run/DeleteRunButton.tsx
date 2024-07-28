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
import { useRouter } from "next/navigation";

import { deleteRun as deleteServerRun } from "~/server/queries";

interface DeleteRunButtonProps {
    teamId?: string;
    runId: string;
}

export default function DeleteRunButton({
    teamId,
    runId,
}: DeleteRunButtonProps) {
    const router = useRouter();

    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    const deleteRun = async () => {
        if (!teamId) {
            return;
        }
        const result = await deleteServerRun(runId, teamId);
        router.refresh();
        if (result?.error) {
            console.error(result.error);
        }
    };

    return (
        !!teamId && (
            <>
                <Button color="danger" onPress={onOpen}>
                    Delete Run
                </Button>
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
                                        permanently delete your run details and
                                        and remove report if it is saved with
                                        our servers.
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
                                        onClick={deleteRun}
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
