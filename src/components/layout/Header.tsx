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
        <header className="sticky flex justify-center border-b">
            <div className="flex items-center justify-between w-full h-16 max-w-3xl px-4 mx-auto sm:px-6">
                <MainNav />
                <UserActions session={session} />
            </div>
        </header>
    );
}
