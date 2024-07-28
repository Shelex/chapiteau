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

interface CreateProjectModalProps {
    teamId: string;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ teamId }) => {
    const [projectName, setProjectName] = useState("");
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    const handleCreateProject = async () => {
        const response = await fetch(`/api/teams/${teamId}/projects`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: projectName, teamId }),
        });

        if (response.ok) {
            return;
        }

        const error = await response.text();
        console.error(error);
    };

    return (
        <div>
            <Button color="success" onPress={onOpen}>+ Add Project</Button>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                Create New Team
                            </ModalHeader>
                            <ModalBody>
                                <Input
                                    value={projectName}
                                    onChange={(e) =>
                                        setProjectName(e.target.value)
                                    }
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
