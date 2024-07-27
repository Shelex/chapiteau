import { MainNav } from "./main-nav";
import UserActions from "./user-actions";
import { SignIn } from "./auth-components";
import { type Session } from "next-auth";

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
