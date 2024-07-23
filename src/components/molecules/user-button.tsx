import { Avatar, AvatarFallback } from "../ui/avatar";
import Image from "next/image";
import { Button } from "../ui/button";
import { auth } from "~/auth";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { SignIn, SignOut } from "./auth-components";

export default async function UserButton({
    searchParams,
}: {
    searchParams?: { callbackUrl?: string };
}) {
    const session = await auth();
    if (!session?.user)
        return <SignIn callback={searchParams?.callbackUrl ?? "/"} />;
    return (
        <div className="flex gap-2 items-center">
            <span className="hidden text-sm sm:inline-flex">
                {session.user.email}
            </span>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className="relative w-8 h-8 rounded-full"
                    >
                        <Avatar className="w-8 h-8">
                            <Image
                                src={
                                    session.user.image ??
                                    "https://source.boringavatars.com/marble/120"
                                }
                                alt={session.user.name ?? ""}
                                width="32"
                                height="32"
                                className="min-w-8"
                            />
                            <AvatarFallback></AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">
                                {session.user.name}
                            </p>
                            <p className="text-xs leading-none text-muted-foreground">
                                {session.user.email}
                            </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuItem>
                        <SignOut />
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
