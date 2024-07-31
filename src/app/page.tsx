import {
    Checkbox,
    Chip,
    Divider,
    Link as LinkComponent,
    Snippet,
} from "@nextui-org/react";
import { DotIcon, PartyPopperIcon } from "lucide-react";
import Link from "next/link";

interface HomeProps {
    searchParams?: { selectedTeam?: string };
}

export default function Home({ searchParams }: Readonly<HomeProps>) {
    const selectedTeam = searchParams?.selectedTeam;

    if (selectedTeam) {
        return null;
    }

    return (
        <div>
            <h1 className="font-bold">Welcome to Chapiteau!</h1>
            <p>To upload data/report to the service:</p>
            <ul className="flex flex-col">
                <Checkbox isDisabled defaultSelected>
                    Sign in with Github
                </Checkbox>
                <li className="flex flex-row">
                    <DotIcon /> Create a team and a project (if you don&apos;t
                    have yet)
                </li>
                <li className="flex flex-row">
                    <DotIcon /> Select team, click &quot;Manage&quot;, create an
                    api key and copy it
                </li>
                <li className="flex flex-row">
                    <DotIcon /> Open project page
                </li>
                <li className="flex flex-row">
                    <DotIcon /> Grab url for specific project
                </li>
                <div className="ml-14">
                    <div className="flex flex-row mt-5 mb-5">
                        <DotIcon />
                        install&nbsp;
                        <Link
                            href="https://www.npmjs.com/package/chapiteau-cli"
                            target="_blank"
                        >
                            <LinkComponent>chapiteau-cli</LinkComponent>
                        </Link>
                        &nbsp;globally or just use via npx
                    </div>
                    <div className="flex flex-row mt-5">
                        <DotIcon /> upload and serve your report:
                    </div>
                    <div className="mt-3 ml-16">
                        <li>
                            If provided path is playwright-report - run info
                            will be parsed from pw report html file and report
                            will be saved and served with service.
                        </li>
                        <li>
                            <Snippet
                                size="lg"
                                style={{
                                    maxWidth: "100%",
                                    overflow: "auto",
                                }}
                            >
                                {`npx chapiteau-cli upload --path "./playwright-report"
                        --url "{URL_FROM_PROJECT_PAGE}" --auth "{PROJECT_API_KEY}"`}
                            </Snippet>
                        </li>
                    </div>
                    <div className="flex flex-row mt-5">
                        <DotIcon /> upload just run statistics:
                    </div>
                    <div className="mt-3 ml-16">
                        <li>
                            If provided path is playwright-report/index.html -
                            run info will be parsed from pw report html file.
                            Report will <Chip color="danger">Not</Chip> be
                            saved.
                        </li>
                        <li>
                            <Snippet
                                size="lg"
                                style={{
                                    maxWidth: "100%",
                                    overflow: "auto",
                                }}
                            >
                                {`npx chapiteau-cli upload --path
                    "./playwright-report/index.html" --url "{URL_FROM_PROJECT_PAGE}" --auth "{PROJECT_API_KEY}" --report-url "{LINK_TO_HOSTED_REPORT}"`}
                            </Snippet>
                        </li>
                    </div>
                </div>
                <li className="flex flex-row mt-3">
                    <PartyPopperIcon className="mr-2" /> Let the clowns and
                    acrobats do the damn job under the hood
                </li>
            </ul>
            <Divider className="mt-10 mb-10" />
            <p className="mt-10 font-semibold">Demo team/project invite:</p>
            <p>
                There is&nbsp;
                <a
                    href="https://chapiteau.shelex.dev/api/teams/a6d130d8-f180-460c-ba0e-5419ddddb0cb/invite/df96f2c2-1b84-4d2e-89a1-3da0252151c1"
                    className="underline"
                >
                    invite link
                </a>
                &nbsp;for a demo team with some randomized data just to have an
                idea how it works (or not ¯\_(ツ)_/¯). Only sign in via github
                is required.
            </p>
            <Divider className="mt-10 mb-10" />
            <p className="mt-10 font-semibold">To invite team member:</p>
            <li className="flex flex-row">
                <DotIcon /> Open &quot;manage&quot; page for specific team
            </li>
            <li className="flex flex-row">
                <DotIcon /> Select &quot;Invites&quot; tab
            </li>
            <li className="flex flex-row">
                <DotIcon /> Click &quot;Add&quot;, specify how much members you
                expect and expiration time
            </li>
            <li className="flex flex-row">
                <DotIcon /> Share the link with team members
            </li>
            <li className="flex flex-row">
                <DotIcon /> Hope that they will not break anything
            </li>
        </div>
    );
}
