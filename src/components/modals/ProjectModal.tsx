"use client";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Tooltip } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { EditIcon } from "~/components/icons/EditIcon";
import { PlusIcon } from "~/components/icons/PlusIcon";
import { createProject, renameProject } from "~/server/queries";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "../ui/form";

type ProjectAction = "create" | "rename";

interface ProjectModalProps {
    teamId: string;
    projectId?: string;
    onChange?: (id: string) => void;
    action: ProjectAction;
}

const projectInputSchema = z.object({
    name: z.string().min(1).max(50),
});

type ProjectInput = z.infer<typeof projectInputSchema>;

const configuration = {
    create: {
        modalTitle: "Create New Project",
        modalSubmitButtonText: "Create",
        action: createProject,
    },
    rename: {
        modalTitle: "Change project name",
        modalSubmitButtonText: "Rename",
        action: renameProject,
    },
};

const ProjectModal = ({
    teamId,
    projectId,
    onChange,
    action,
}: ProjectModalProps) => {
    const router = useRouter();
    const form = useForm<ProjectInput>({
        resolver: zodResolver(projectInputSchema),
        defaultValues: {
            name: "",
        },
    });

    const config = configuration[action];

    const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();

    async function onSubmit(values: ProjectInput) {
        const result = await config.action(
            values.name,
            action === "create" ? teamId : projectId ?? ""
        );
        if (!result) {
            return;
        }

        onChange?.(teamId) ?? router.refresh();
        onClose?.();
        form.reset();
    }

    return (
        <div>
            <Tooltip
                color={action === "create" ? "success" : "warning"}
                content={`${action} project`}
                placement="right"
            >
                <Button
                    className="max-w-[30px]"
                    color={action === "create" ? "success" : "warning"}
                    onPress={onOpen}
                >
                    {action === "create" ? <PlusIcon /> : <EditIcon />}
                </Button>
            </Tooltip>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)}>
                                <ModalHeader className="flex flex-col gap-1">
                                    {config.modalTitle}
                                </ModalHeader>
                                <ModalBody>
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input
                                                        isRequired
                                                        label="Name"
                                                        placeholder={`${
                                                            action === "create"
                                                                ? ""
                                                                : "new"
                                                        } project name`}
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </ModalBody>
                                <ModalFooter>
                                    <Button
                                        color="danger"
                                        onPress={() => {
                                            onClose();
                                            form.reset();
                                        }}
                                    >
                                        Close
                                    </Button>
                                    <Button color="primary" type="submit">
                                        {config.modalSubmitButtonText}
                                    </Button>
                                </ModalFooter>
                            </form>
                        </Form>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
};

export default ProjectModal;
