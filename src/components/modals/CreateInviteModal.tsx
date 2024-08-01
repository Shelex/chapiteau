"use client";
import { getLocalTimeZone, today } from "@internationalized/date";
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
import { Snippet } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

import { env } from "~/env";
import { type Team } from "~/server/db/schema";
import { createInvite } from "~/server/queries";

interface CreateInviteModalProps {
    team: Team;
}

interface Created {
    token?: string;
}

const CreateApiKeyModal = ({ team }: CreateInviteModalProps) => {
    const [expireAt, setExpireAt] = useState(today(getLocalTimeZone()));
    const [limit, setLimit] = useState(1);
    const [created, setCreated] = useState<Created>({});
    const router = useRouter();

    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    const handleCreateApiKeyServer = async () => {
        // TODO use form
        if (!expireAt || !limit || limit < 0 || limit > 32767) {
            return;
        }
        const created = await createInvite({
            teamId: team.id,
            expireAt: expireAt.toDate(getLocalTimeZone()),
            limit,
        });

        setLimit(1);
        setExpireAt(today(getLocalTimeZone()));
        setCreated({
            token: created?.token,
        });
        router.refresh();
    };

    return (
        <div>
            <Button color="success" onPress={onOpen}>
                + Add Invite for &quot;{team.name}&quot;
            </Button>
            {created?.token && (
                <>
                    <p>
                        Please share this url with members you want to invite:
                    </p>
                    <Snippet
                        color="success"
                        size="sm"
                        hideSymbol
                    >{`${env.NEXT_PUBLIC_AUTH_URL}/api/teams/${team.id}/invite/${created.token}`}</Snippet>
                </>
            )}
            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                Create New Invite
                            </ModalHeader>
                            <ModalBody>
                                <Input
                                    label="How much users can accept invite"
                                    isRequired
                                    value={limit.toString()}
                                    validate={(value) => {
                                        const num = Number(value);
                                        if (isNaN(num))
                                            return "Limit should be a number";
                                        if (num < 1)
                                            return "Limit should be a positive number";
                                        if (num > 32767)
                                            return "Limit should be less than 32767";
                                        return true;
                                    }}
                                    onChange={(e) => {
                                        const numeric = Number(e.target.value);
                                        !isNaN(numeric) && setLimit(numeric);
                                    }}
                                />
                                <DatePicker
                                    isRequired
                                    hourCycle={24}
                                    label="Expire At"
                                    value={expireAt}
                                    validate={(value) =>
                                        !!value
                                            ? true
                                            : "Expiration date is required"
                                    }
                                    onChange={setExpireAt}
                                />
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" onPress={onClose}>
                                    Close
                                </Button>
                                <Button
                                    color="primary"
                                    onPress={onClose}
                                    onClick={handleCreateApiKeyServer}
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

export default CreateApiKeyModal;
