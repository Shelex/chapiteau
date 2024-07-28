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
import React, { useCallback, useState } from "react";

import { type Team } from "~/server/db/schema";

interface CreateApiKeyModalProps {
    team: Team;
}

const CreateApiKeyModal = ({ team }: CreateApiKeyModalProps) => {
    const [keyName, setKeyName] = useState("");
    const [expireAt, setExpireAt] = useState(today(getLocalTimeZone()));
    const [token, setToken] = useState("");

    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    const handleCreateApiKey = useCallback(async () => {
        const response = await fetch(`/api/teams/${team.id}/tokens`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: keyName,
                teamId: team.id,
                expireAt,
            }),
        });

        if (response.ok) {
            const body = (await response.json()) as { token: string };
            setToken(body.token);
            return;
        }

        const error = await response.text();
        console.error(error);
    }, [expireAt, keyName, team]);

    return (
        <div>
            <Button color="success" onPress={onOpen}>+ Add Api Key for {team.name}</Button>
            {token && (
                <>
                    <p>Please copy your api key:</p>
                    <code>{token}</code>
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
                                    onChange={(e) => setKeyName(e.target.value)}
                                    placeholder="Api Key Name"
                                />
                                <DatePicker
                                    isRequired
                                    hourCycle={24}
                                    label="Expire At"
                                    value={expireAt}
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
                                    onClick={handleCreateApiKey}
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
