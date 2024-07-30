"use client";
import { Button } from "@nextui-org/button";
import {
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
} from "@nextui-org/dropdown";
import { User } from "@nextui-org/user";
import { type Session } from "next-auth";
import { signOut } from "next-auth/react";
import React from "react";

export default function UserActions({
    session,
}: Readonly<{ session: Session | null }>) {
    return (
        <Dropdown>
            <DropdownTrigger>
                <Button variant="light">
                    <User
                        name={session?.user.name}
                        description={session?.user.email}
                        avatarProps={{
                            fallback:
                                "https://source.boringavatars.com/marble/120",
                            src: session?.user.image ?? "",
                        }}
                    />
                </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="actions" variant="bordered">
                <DropdownItem key="signOut">
                    <Button
                        variant="ghost"
                        color="warning"
                        className="w-full p-2"
                        onClick={() => signOut()}
                    >
                        Sign Out
                    </Button>
                </DropdownItem>
            </DropdownMenu>
        </Dropdown>
    );
}
