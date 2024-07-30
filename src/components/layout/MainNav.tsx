"use client";
import { Button } from "@nextui-org/button";
import Image from "next/image";
import React from "react";

import CustomLink from "./CustomLink";

export function MainNav() {
    return (
        <CustomLink href="/">
            <Button variant="bordered">
                <Image
                    src="/logo.jpg"
                    alt="Home"
                    width="42"
                    height="42"
                    className="min-w-10"
                />
                <h1>Chapiteau</h1>
            </Button>
        </CustomLink>
    );
}
