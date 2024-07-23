"use client";

import { useCallback } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";

interface DeleteRunButtonProps {
    teamId?: string;
    runId: string;
}

export default function DeleteRunButton({
    teamId,
    runId,
}: DeleteRunButtonProps) {
    const deleteRun = useCallback(async (teamId: string, runId: string) => {
        await fetch(`/api/teams/${teamId}/runs/${runId}`, {
            method: "DELETE",
        });
    }, []);

    return (
        !!teamId && (
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive">Delete Run</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete your run details and and remove report if it
                            is saved with our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={async () => await deleteRun(teamId, runId)}
                        >
                            Continue
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        )
    );
}
