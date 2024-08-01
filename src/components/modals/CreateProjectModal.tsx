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

import { createProject } from "~/server/queries";

interface CreateProjectModalProps {
    teamId: string;
    onCreated?: (teamId: string) => void;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
    teamId,
    onCreated,
}) => {
    const [projectName, setProjectName] = useState("");
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    const handleCreateProject = async () => {
        // TODO use form
        if (!projectName || projectName?.length > 50 || !teamId) {
            return;
        }
        await createProject(projectName, teamId);
        setProjectName("");
        onCreated?.(teamId);
    };

    return (
        <div>
            <Button className="w-full" color="success" onPress={onOpen}>
                + Add Project
            </Button>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                Create New Project
                            </ModalHeader>
                            <ModalBody>
                                <Input
                                    value={projectName}
                                    onChange={(e) =>
                                        setProjectName(e.target.value)
                                    }
                                    validate={(value) => {
                                        if (!value)
                                            return "Project Name is required";
                                        if (value.length > 50)
                                            return "Project Name is too long";
                                        return true
                                    }}
                                    placeholder="Project Name"
                                />
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" onPress={onClose}>
                                    Close
                                </Button>
                                <Button
                                    color="primary"
                                    onPress={onClose}
                                    onClick={handleCreateProject}
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

export default CreateProjectModal;
