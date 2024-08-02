"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    CalendarDate,
    CalendarDateTime,
    type DateValue,
    getLocalTimeZone,
    today,
} from "@internationalized/date";
import {
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    useDisclosure,
} from "@nextui-org/modal";
import { Button, DatePicker, Input, Tooltip } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { type ApiKey, type Team } from "~/server/db/schema";
import { createApiKey, editApiKey } from "~/server/queries";

import { EditIcon } from "../icons/EditIcon";
import { PlusIcon } from "../icons/PlusIcon";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "../ui/form";

type ApiKeyAction = "create" | "edit";

interface ApiKeyModalProps {
    team: Team;
    apiKey?: Omit<ApiKey, "token" | "teamId">;
    onChange?: (data: string) => void;
    action: ApiKeyAction;
}

const apiKeyInputSchema = z.object({
    name: z.string().min(1).max(50),
    expireAt: z.custom<DateValue>(
        (val: DateValue) =>
            val instanceof CalendarDate || val instanceof CalendarDateTime,
        {
            message: "Should be a future date",
        }
    ),
});

type ApiKeyInput = z.infer<typeof apiKeyInputSchema>;

const configuration = {
    create: {
        triggerButtonText: "Add Api Key",
        modalTitle: "Create New Api Key",
        modalSubmitButtonText: "Create",
        action: createApiKey,
    },
    edit: {
        triggerButtonText: "Edit",
        modalTitle: "Edit Api Key",
        modalSubmitButtonText: "Edit",
        action: editApiKey,
    },
};

const ApiKeyModal = ({ team, onChange, action, apiKey }: ApiKeyModalProps) => {
    const router = useRouter();

    const form = useForm<ApiKeyInput>({
        resolver: zodResolver(apiKeyInputSchema),
        defaultValues: {
            name: action === "create" ? "" : apiKey?.name ?? "",
            expireAt:
                action === "create"
                    ? today(getLocalTimeZone()).add({ days: 1 })
                    : !!apiKey?.expireAt
                    ? new CalendarDate(
                          apiKey.expireAt.getFullYear(),
                          apiKey.expireAt.getMonth() + 1,
                          apiKey.expireAt.getDate()
                      )
                    : today(getLocalTimeZone()),
        },
    });

    const config = configuration[action];

    const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();

    async function onSubmit(values: ApiKeyInput) {
        const input = { ...values, teamId: team.id };
        const result = await config.action(
            {
                ...input,
                expireAt: values.expireAt.toDate(getLocalTimeZone()),
            },
            apiKey?.id ?? ""
        );
        if (!result) {
            return;
        }

        onChange?.(action === "create" ? result.token : result.id) ??
            router.refresh();
        onClose?.();
        form.reset();
    }

    return (
        <div>
            <div className="flex flex-row">
                <Tooltip
                    color={action === "create" ? "success" : "warning"}
                    content={`${action} api key`}
                    placement="left"
                >
                    <Button
                        className="w-full"
                        color={action === "create" ? "success" : "warning"}
                        onPress={onOpen}
                    >
                        {action === "create" ? <PlusIcon /> : <EditIcon />}
                    </Button>
                </Tooltip>
            </div>
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
                                                        placeholder="api key name"
                                                        {...field}
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
                                                        isRequired
                                                        showMonthAndYearPickers
                                                        value={field.value}
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

export default ApiKeyModal;
