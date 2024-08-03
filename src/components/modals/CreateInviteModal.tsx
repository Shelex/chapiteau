"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    CalendarDate,
    CalendarDateTime,
    getLocalTimeZone,
    today,
} from "@internationalized/date";
import { Button } from "@nextui-org/button";
import { DatePicker } from "@nextui-org/date-picker";
import { Input } from "@nextui-org/input";
import {
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    useDisclosure,
} from "@nextui-org/modal";
import { type DateValue, Snippet, Tooltip } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { env } from "~/env";
import { type Team } from "~/server/db/schema";
import { createInvite } from "~/server/queries";

import { PlusIcon } from "../icons/PlusIcon";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "../ui/form";

interface CreateInviteModalProps {
    team: Team;
    isAdmin: boolean;
}

const inviteInputSchema = z.object({
    limit: z.number().int().min(1).max(32767),
    expireAt: z.custom<DateValue>(
        (val: DateValue) =>
            val instanceof CalendarDate || val instanceof CalendarDateTime,
        {
            message: "Should be a future date",
        }
    ),
});

type InviteInput = z.infer<typeof inviteInputSchema>;

const CreateInviteModal = ({ team, isAdmin }: CreateInviteModalProps) => {
    const router = useRouter();

    const form = useForm<InviteInput>({
        resolver: zodResolver(inviteInputSchema),
        defaultValues: {
            limit: 1,
            expireAt: today(getLocalTimeZone()).add({ days: 1 }),
        },
    });

    const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();

    async function onSubmit(values: InviteInput) {
        const created = await createInvite({
            teamId: team.id,
            expireAt: values.expireAt.toDate(getLocalTimeZone()),
            limit: values.limit,
        });
        if (!created) {
            toast.error("Failed to create invite");
            return;
        }

        router.refresh();
        onClose?.();
        form.reset();
        toast.success("Invite created successfully", {
            description: (
                <div>
                    <p>Please share this url with members</p>
                    <p>you want to invite:</p>
                    <Snippet
                        color="success"
                        size="sm"
                        style={{
                            maxWidth: "35%",
                            overflowX: "scroll",
                        }}
                        hideSymbol
                    >{`${env.NEXT_PUBLIC_AUTH_URL}/api/teams/${team?.id}/invite/${created.token}`}</Snippet>
                </div>
            ),
        });
    }

    return (
        <div>
            <Tooltip color="success" content={"create invite"} placement="left">
                {isAdmin && (
                    <Button className="w-full" color="success" onPress={onOpen}>
                        <PlusIcon />
                    </Button>
                )}
            </Tooltip>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)}>
                                <ModalHeader className="flex flex-col gap-1">
                                    Create New Invite
                                </ModalHeader>
                                <ModalBody>
                                    <FormField
                                        control={form.control}
                                        name="limit"
                                        render={() => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input
                                                        isRequired
                                                        label="How much users can accept invite"
                                                        placeholder="members limit"
                                                        {...form.register(
                                                            "limit",
                                                            {
                                                                valueAsNumber:
                                                                    true,
                                                            }
                                                        )}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="expireAt"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <DatePicker
                                                        showMonthAndYearPickers
                                                        value={field.value}
                                                        isRequired
                                                        granularity="day"
                                                        label="Expire at"
                                                        minValue={today(
                                                            getLocalTimeZone()
                                                        ).add({ days: 1 })}
                                                        onChange={(date) => {
                                                            if (date) {
                                                                field.onChange(
                                                                    date
                                                                );
                                                            }
                                                        }}
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
                                        Create
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

export default CreateInviteModal;
