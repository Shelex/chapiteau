"use client";
import { Button } from "@nextui-org/button";
import { User } from "@nextui-org/user";
import {
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
} from "@nextui-org/dropdown";
import { type Session } from "next-auth";
import React from "react";
import { signOut } from "next-auth/react";

export default function UserActions({ session }: { session: Session }) {
    return (
        <Dropdown>
            <DropdownTrigger>
                <Button variant="light">
                    <User
                        name={session.user.name}
                        description={session.user.email}
                        avatarProps={{
                            fallback:
                                "https://source.boringavatars.com/marble/120",
                            src: session.user.image ?? "",
                        }}
                    />
                </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="actions">
                <DropdownItem key="signOut">
                    <Button
                        variant="ghost"
                        color="warning"
                        className="w-full p-0"
                        onClick={() => signOut()}
                    >
                        Sign Out
                    </Button>
                </DropdownItem>
            </DropdownMenu>
        </Dropdown>
    );
}
