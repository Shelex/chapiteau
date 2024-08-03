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

import { leaveTeam as leaveTeamMutation } from "~/server/queries";

import KickIcon from "../icons/KickIcon";

interface LeaveTeamProps {
    userId: string;
    teamId: string;
    isAdmin: boolean;
}

export default function LeaveTeam({ userId, teamId, isAdmin }: LeaveTeamProps) {
    const router = useRouter();

    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    const leaveTeam = async () => {
        if (!userId || !teamId) {
            return;
        }
        const result = await leaveTeamMutation(teamId, userId, isAdmin);

        if (result?.error) {
            toast.error("Not left the team", {
                description: result.error,
            });
        }

        router.refresh();
    };

    return (
        !!userId &&
        !!teamId && (
            <>
                <Tooltip
                    color="danger"
                    content="leave the team"
                    placement="top"
                >
                    <Button
                        color="danger"
                        size="sm"
                        onPress={onOpen}
                    >
                        <KickIcon />
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
                                        permanently delete your connection with
                                        the team and you will have no access to
                                        it.
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
                                        onClick={leaveTeam}
                                    >
                                        Enough, just let go!
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
