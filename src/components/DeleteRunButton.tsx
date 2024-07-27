"use client";

import { useCallback } from "react";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
} from "@nextui-org/modal";
import { Button } from "@nextui-org/button";
import { useRouter } from "next/navigation";

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

    const deleteRun = useCallback(
        async (teamId: string, runId: string) => {
            await fetch(`/api/teams/${teamId}/runs/${runId}`, {
                method: "DELETE",
            });
            router.refresh();
        },
        [router]
    );

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
                                        onClick={async () =>
                                            await deleteRun(teamId, runId)
                                        }
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
