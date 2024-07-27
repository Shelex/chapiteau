import { Button } from "@nextui-org/button";
import { signIn, signOut } from "~/auth";

export function SignIn({
    provider,
    callback,
    ...props
}: { provider?: string; callback: string } & React.ComponentPropsWithRef<
    typeof Button
>) {
    return (
        <form
            action={async () => {
                "use server";
                await signIn(provider, {
                    redirectTo: callback,
                });
            }}
        >
            <Button {...props}>Sign In</Button>
        </form>
    );
}

export function SignOut(props: React.ComponentPropsWithRef<typeof Button>) {
    return (
        <form
            action={async () => {
                "use server";
                await signOut();
            }}
            className="w-full"
        >
            <Button variant="ghost" color="warning" className="w-full p-0" {...props}>
                Sign Out
            </Button>
        </form>
    );
}
