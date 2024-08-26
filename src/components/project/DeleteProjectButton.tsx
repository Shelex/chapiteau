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

import { withError } from "~/lib";
import { type Project } from "~/server/db/schema";
import { deleteProject } from "~/server/queries";

import { DeleteIcon } from "../icons/DeleteIcon";

interface DeleteProjectButtonProps {
    teamId?: string;
    project?: Project;
    onDelete?: (teamId: string) => void;
}

export default function DeleteProjectButton({
    teamId,
    project,
    onDelete,
}: DeleteProjectButtonProps) {
    const router = useRouter();
    const [confirm, setConfirm] = useState("");

    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    const DeleteProject = async () => {
        if (!project || !teamId) {
            return;
        }
        const { result, error } = await withError(
            deleteProject(teamId, project.id)
        );
        if (result?.error ?? error) {
            toast.error("Failed to delete project", {
                description: result?.error ?? error?.message ?? "",
            });
            return;
        }
        onDelete?.(teamId);
        toast.success(
            `Request to delete project ${project.name} sent successfully`
        );
        router.refresh();
        router.push("/");
    };

    return (
        !!teamId && (
            <>
                <Tooltip
                    color="danger"
                    content="delete project"
                    placement="bottom"
                >
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
                                        permanently delete your run details and
                                        and remove report if it is saved with
                                        our servers.
                                    </p>
                                    <p>
                                        Please type project name&nbsp;
                                        <strong className="break-all">
                                            {project?.name}
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
                                        isDisabled={confirm !== project?.name}
                                        onPress={onClose}
                                        onClick={DeleteProject}
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
