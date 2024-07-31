import "./globals.css";

import { NextUIProvider } from "@nextui-org/react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { redirect } from "next/navigation";
import Script from "next/script";
import { SessionProvider } from "next-auth/react";

import { auth } from "~/auth";
import Header from "~/components/layout/Header";
import Sidebar from "~/components/layout/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Chapiteau",
    description: "Service for historical Playwright report data",
};

export default async function RootLayout({
    children,
    searchParams,
}: Readonly<{
    children: React.ReactNode;
    searchParams?: {
        callbackUrl?: string;
    };
}>) {
    const session = await auth();

    if (!session?.user)
        redirect(`/api/auth/signin?${searchParams?.callbackUrl ?? ""}`);

    return (
        <html lang="en">
            <Script
                defer
                src="https://analytics.shelex.dev/script.js"
                data-website-id="47a1fa0d-0aef-4576-b5d4-399fef7a202b"
            ></Script>
            <body className={inter.className}>
                <NextUIProvider>
                    <SessionProvider basePath={"/api/auth"} session={session}>
                        <div className="flex flex-col h-screen">
                            <div className="h-20 shrink-0">
                                <Header session={session} />
                            </div>
                            <div className="flex flex-row h-full w-full">
                                <div className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 overflow-y-scroll overflow-x-scroll">
                                    <Sidebar session={session} />
                                </div>
                                <main className="flex-auto basis-2/3 h-[calc(100vh-5rem)] px-2 py-2 mx-auto sm:px-6 md:py-6 overflow-y-scroll">
                                    {children}
                                </main>
                            </div>
                        </div>
                    </SessionProvider>
                </NextUIProvider>
            </body>
        </html>
    );
}
