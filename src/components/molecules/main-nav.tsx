"use client";

import Image from "next/image";

import { cn } from "~/lib/utils";
import CustomLink from "./custom-link";
import { NavigationMenuLink } from "../ui/navigation-menu";
import React from "react";
import { Button } from "@nextui-org/button";

export function MainNav() {
    return (
        <div className="flex gap-4 items-center">
            <CustomLink href="/">
                <Button variant="bordered">
                    <Image
                        src="/logo.jpg"
                        alt="Home"
                        width="32"
                        height="32"
                        className="min-w-8"
                    />
                </Button>
            </CustomLink>
        </div>
    );
}

const ListItem = React.forwardRef<
    React.ElementRef<"a">,
    React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
    return (
        <li>
            <NavigationMenuLink asChild>
                <a
                    ref={ref}
                    className={cn(
                        "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                        className
                    )}
                    {...props}
                >
                    <div className="text-sm font-medium leading-none">
                        {title}
                    </div>
                    <p className="text-sm leading-snug line-clamp-2 text-muted-foreground">
                        {children}
                    </p>
                </a>
            </NavigationMenuLink>
        </li>
    );
});
ListItem.displayName = "ListItem";
