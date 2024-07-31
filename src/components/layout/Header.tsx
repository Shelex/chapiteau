import { Tooltip } from "@nextui-org/react";
import { GithubIcon } from "lucide-react";
import Link from "next/link";
import { type Session } from "next-auth";

import { SignIn } from "./AuthComponents";
import { MainNav } from "./MainNav";
import UserActions from "./UserNavActions";

export default function Header({
    session,
    searchParams,
}: {
    session: Session | null;
    searchParams?: { callbackUrl?: string };
}) {
    if (!session?.user)
        return <SignIn callback={searchParams?.callbackUrl ?? "/"} />;

    return (
        <header className="sticky flex items-center justify-between border-b h-20 px-4 mx-auto sm:px-6">
            <MainNav />
            <div className="flex flex-row gap-12">
                <Tooltip
                    color="success"
                    content="Check on Github"
                    placement="left"
                >
                    <Link
                        className="border-solid border-1 rounded-full w-11 hover:bg-default-100"
                        href="https://github.com/Shelex/chapiteau"
                        target="_blank"
                    >
                        <GithubIcon className="w-full h-full p-2" />
                    </Link>
                </Tooltip>
                <UserActions session={session} />
            </div>
        </header>
    );
}
