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
            <UserActions session={session} />
        </header>
    );
}
