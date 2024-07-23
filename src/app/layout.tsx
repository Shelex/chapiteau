import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "~/components/molecules/header";
import { auth } from "~/auth";
import { SessionProvider } from "next-auth/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Chapiteau",
    description: "Service for historical Playwright report data",
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const session = await auth();

    return (
        <html lang="en">
            <body className={inter.className}>
                <SessionProvider basePath={"/api/auth"} session={session}>
                    <div className="flex flex-col justify-between w-full h-full min-h-screen">
                        <Header />
                        <main className="flex-auto w-full max-w-3xl px-4 py-4 mx-auto sm:px-6 md:py-6">
                            {children}
                        </main>
                    </div>
                </SessionProvider>
            </body>
        </html>
    );
}
