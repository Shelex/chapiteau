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

import { type Team } from "~/server/db/schema";
import { createApiKey } from "~/server/queries";

interface CreateApiKeyModalProps {
    team: Team;
}

interface Created {
    token?: string;
    name?: string;
}

const CreateApiKeyModal = ({ team }: CreateApiKeyModalProps) => {
    const [keyName, setKeyName] = useState("");
    const [expireAt, setExpireAt] = useState(today(getLocalTimeZone()));
    const [created, setCreated] = useState<Created>({});
    const router = useRouter();

    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    const handleCreateApiKeyServer = async () => {
        // TODO use form
        if (!keyName || keyName?.length > 50 || !expireAt) {
            return;
        }
        const created = await createApiKey({
            name: keyName,
            teamId: team.id,
            expireAt: expireAt.toDate(getLocalTimeZone()),
        });
        setKeyName("");
        setExpireAt(today(getLocalTimeZone()));
        setCreated({
            token: created?.token,
            name: created?.name,
        });
        router.refresh();
    };

    return (
        <div>
            <Button color="success" onPress={onOpen}>
                + Add Api Key for {team.name}
            </Button>
            {created?.token && (
                <>
                    <p>Please copy your api key &quot;{created.name}&quot;:</p>
                    <Snippet color="success" hideSymbol>{created.token}</Snippet>
                </>
            )}
            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                Create New Api Key
                            </ModalHeader>
                            <ModalBody>
                                <Input
                                    isRequired
                                    value={keyName}
                                    onChange={(e) => !!e.target.value && setKeyName(e.target.value)}
                                    validate={(value) => {
                                        if (!value)
                                            return "Api Key Name is required";
                                        if (value.length > 50)
                                            return "Api Key Name is too long";
                                        return true
                                    }}
                                    placeholder="Api Key Name"
                                />
                                <DatePicker
                                    isRequired
                                    hourCycle={24}
                                    label="Expire At"
                                    value={expireAt}
                                    validate={(value) => !!value ? true : "Expiration date is required"}
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
