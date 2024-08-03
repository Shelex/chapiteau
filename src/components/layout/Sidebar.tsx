"use client";
import { Button } from "@nextui-org/react";
import Link from "next/link";
import { type Session } from "next-auth";
import { useEffect, useState } from "react";

import ProjectModal from "../modals/ProjectModal";
import TeamModal from "../modals/TeamModal";
import ProjectList from "../project/ProjectList";
import TeamSelector from "../team/TeamSelector";
import { Switch } from "../ui/switch";

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

    const [enableEditProjects, setEnableEditProjects] = useState(false);

    return (
        <div className="flex-col m-4">
            <div className="min-w-full">
                <TeamSelector
                    current={currentTeam}
                    onChangedTeam={onChangedTeam}
                />
            </div>
            <div className="p-1 m-1 flex flex-wrap">
                <div className="basis-1/2 p-1">
                    <TeamModal
                        userId={session?.user?.id ?? ""}
                        onChange={onChangedTeam}
                        action="create"
                    />
                </div>
                <div className="basis-1/2 p-1">
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
                <div className="flex flex-col rounded h-full">
                    <div className="flex flex-wrap justify-between p-2 bg-primary-50 rounded-xl">
                        <div className="flex flex-col h-16">
                            <div className="font-bold">Projects</div>
                            <div className="mt-4 w-full">
                                <Switch
                                    id="edit-projects"
                                    checked={enableEditProjects}
                                    onCheckedChange={setEnableEditProjects}
                                    className="data-[state=checked]:bg-warning data-[state=unchecked]:bg-default w-16"
                                    uncheckeditem={
                                        <p className="text-primary ml-1 w-4">
                                            edit
                                        </p>
                                    }
                                    checkeditem={
                                        <p className="text-white ml-1 w-4">
                                            off
                                        </p>
                                    }
                                />
                            </div>
                        </div>
                        <div className="flex flex-col items-center justify-center">
                            <ProjectModal
                                teamId={currentTeam}
                                onChange={onCreatedProject}
                                action="create"
                            />
                        </div>
                    </div>
                    <div>
                        <ProjectList
                            teamId={currentTeam}
                            onChange={onCreatedProject}
                            refreshId={refreshId}
                            enabledEdit={enableEditProjects}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
