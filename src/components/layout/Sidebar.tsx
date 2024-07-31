"use client";
import { Button } from "@nextui-org/react";
import Link from "next/link";
import { type Session } from "next-auth";
import { useEffect, useState } from "react";

import CreateProjectModal from "../modals/CreateProjectModal";
import CreateTeamModal from "../modals/CreateTeamModal";
import ProjectList from "../project/ProjectList";
import TeamSelector from "../team/TeamSelector";

export default function Sidebar({
    session,
}: Readonly<{
    session: Session | null;
}>) {
    const [currentTeam, setCurrentTeam] = useState("");

    useEffect(() => {
        if (!currentTeam) {
            const stored = window.localStorage.getItem("selectedTeam");
            setCurrentTeam(stored ?? "");
        }
    }, [currentTeam]);

    const [refreshId, setRefreshId] = useState(crypto.randomUUID());

    const onChangedTeam = (teamId: string) => {
        setCurrentTeam(teamId);
    };

    const onCreatedProject = () => {
        setRefreshId(crypto.randomUUID());
    };

    return (
        <div className="flex-col m-4 h-screen">
            <div className="min-w-full">
                <TeamSelector
                    current={currentTeam}
                    onChangedTeam={onChangedTeam}
                />
            </div>
            <div className="p-1 m-1 flex flex-wrap">
                <div className="grow p-1">
                    <CreateTeamModal
                        userId={session?.user?.id ?? ""}
                        onCreated={onChangedTeam}
                    />
                </div>
                <div className="grow p-1">
                    {currentTeam && (
                        <Link
                            href={`/team/${currentTeam}/`}
                            legacyBehavior
                            passHref
                            prefetch
                        >
                            <Button className="w-full" color="secondary">
                                Manage
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
            {currentTeam && (
                <div className="flex flex-col rounded h-screen">
                    <div className="flex flex-wrap justify-between p-4 bg-primary-50 rounded-xl">
                        <div className="font-bold">Projects</div>
                        <div>
                            <CreateProjectModal
                                teamId={currentTeam}
                                onCreated={onCreatedProject}
                            />
                        </div>
                    </div>
                    <div>
                        <ProjectList
                            teamId={currentTeam}
                            refreshId={refreshId}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
