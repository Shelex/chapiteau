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
import { toast } from "sonner";
import { z } from "zod";

import { withError } from "~/lib";
import { type Team } from "~/server/db/schema";
import { type User } from "~/server/db/users";
import { createTeam, renameTeam } from "~/server/queries";

import { EditIcon } from "../icons/EditIcon";
import { PlusIcon } from "../icons/PlusIcon";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "../ui/form";

type TeamAction = "create" | "rename";
interface TeamModalProps {
    userId: User["id"];
    team?: Team;
    onChange?: (teamId: string) => void;
    action: TeamAction;
}

const teamInputSchema = z.object({
    name: z.string().min(1).max(50),
});

type TeamInput = z.infer<typeof teamInputSchema>;

const configuration = {
    create: {
        modalTitle: "Create New Team",
        modalSubmitButtonText: "Create",
        action: createTeam,
    },
    rename: {
        modalTitle: "Change team name",
        modalSubmitButtonText: "Rename",
        action: renameTeam,
    },
};

const TeamModal = ({ userId, team, onChange, action }: TeamModalProps) => {
    const router = useRouter();

    const form = useForm<TeamInput>({
        resolver: zodResolver(teamInputSchema),
        defaultValues: {
            name: "",
        },
    });

    const config = configuration[action];

    const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();

    async function onSubmit(values: TeamInput) {
        const { result, error } = await withError(
            config.action(
                values.name,
                action === "create" ? userId : team?.id ?? ""
            )
        );
        if (error ?? !result) {
            toast.error(`Failed to ${action} team`);
            return;
        }

        onChange?.(result.id) ?? router.refresh();
        onClose?.();
        form.reset();
        toast.success(`Successfully ${action}d team ${values.name}`);
        if (action === "create") {
            router.push("/");
        }
    }

    return (
        <div>
            <Tooltip
                color={action === "create" ? "success" : "warning"}
                content={`${action} team`}
                placement="bottom"
            >
                <Button
                    className={action === "create" ? "w-full" : ""}
                    color={action === "create" ? "success" : "warning"}
                    size={action === "create" ? "md" : "sm"}
                    onPress={onOpen}
                >
                    {action === "create" ? (
                        <div className="flex flex-row items-center">
                            <PlusIcon /> Team
                        </div>
                    ) : (
                        <EditIcon />
                    )}
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
                                                        placeholder="team name"
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

export default TeamModal;
