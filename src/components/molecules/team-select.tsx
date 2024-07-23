"use client";
import * as React from "react";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";

import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "~/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "~/components/ui/popover";
import { type Team } from "~/server/db/schema";

interface SelectTeamProps {
    teams: Team[];
    selected?: Team;
    onSelect: (team: Team) => void;
}

export function SelectTeam({
    teams = [],
    selected,
    onSelect,
}: SelectTeamProps) {
    const [open, setOpen] = React.useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[200px] justify-between"
                >
                    {selected
                        ? teams.find((team) => team.id === selected.id)?.name
                        : "Select team..."}
                    <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandInput
                        placeholder="Search team..."
                        className="h-9"
                    />
                    <CommandEmpty>No teams found.</CommandEmpty>
                    <CommandGroup>
                        <CommandList>
                            {teams.map((team) => (
                                <CommandItem
                                    key={team.id}
                                    value={team.id}
                                    onSelect={() => {
                                        onSelect(team);
                                        setOpen(false);
                                    }}
                                >
                                    {team.name}
                                    <CheckIcon
                                        className={cn(
                                            "ml-auto h-4 w-4",
                                            selected?.id === team.id
                                                ? "opacity-100"
                                                : "opacity-0"
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandList>
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
