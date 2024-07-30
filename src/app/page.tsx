import { Checkbox, Chip, Snippet } from "@nextui-org/react";
import { DotIcon, PartyPopperIcon } from "lucide-react";

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
                    <DotIcon /> Have a team and a project
                </li>
                <li className="flex flex-row">
                    <DotIcon /> Create an api key for your project by selecting
                    team and click `Manage`
                </li>
                <li className="flex flex-row">
                    <DotIcon /> Open project page
                </li>
                <li className="flex flex-row">
                    <DotIcon /> Grab url for specific project
                </li>
                <div className="ml-14">
                    <div className="flex flex-row">
                        <DotIcon /> to upload just run data:
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
                    "./playwright-report/index.html" --url "
                    {URL_FROM_PROJECT_PAGE}" --auth "{PROJECT_API_KEY}"
                    --build-url "{CI_BUILD_URL_OPTIONAL}" --build-name "
                    {CI_BUILD_NAME_OPTIONAL}" --report-url "
                    {LINK_TO_HOSTED_REPORT}"`}
                            </Snippet>
                        </li>
                    </div>
                    <div className="flex flex-row mt-5">
                        <DotIcon /> to upload and serve your report
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
                        --url "{URL_FROM_PROJECT_PAGE}" --auth "
                        {PROJECT_API_KEY}" --build-url "{CI_BUILD_URL_OPTIONAL}"
                        --build-name "{CI_BUILD_NAME_OPTIONAL}"`}
                            </Snippet>
                        </li>
                    </div>
                </div>
                <li className="flex flex-row mt-3">
                    <PartyPopperIcon className="mr-2" /> Let the clowns and acrobats do the damn
                    job under the hood
                </li>
            </ul>
        </div>
    );
}
