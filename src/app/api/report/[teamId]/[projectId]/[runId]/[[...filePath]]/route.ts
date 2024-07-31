import { promises as fs } from "fs";
import { redirect } from "next/navigation";
import { type NextRequest, NextResponse } from "next/server";
import path from "path";

import { auth } from "~/auth";
import { env } from "~/env";
import { getRunNeighbors, userIsTeamMember } from "~/server/queries";

interface Links {
    nextRunId?: string;
    prevRunId?: string;
}

interface ReportParams {
    teamId: string;
    projectId: string;
    runId: string;
    filePath?: string[];
}

const createButton = (id: string, name: string, href?: string) => {
    const button = `
        const ${id} = document.createElement('button');
        ${id}.textContent = '${!href ? "N/A" : name}';
        ${id}.id = '${id}';
        ${id}.style.width = '120px';
        ${id}.style.padding = '10px 20px';
        ${id}.style.margin = '10px 0px 0px 25px';
        ${id}.style.fontSize = '14px';`;

    const maybeDisable = !href ? `${id}.disabled = true;` : "";

    const onClick = `function handle${id}Click() {
            window.location.href = '${href}';
        };`;

    const registerClick = `${id}.addEventListener('click', handle${id}Click);`;

    return `${button}${maybeDisable}${onClick}${registerClick}`;
};

const addNav = (
    content: string,
    fqdn: string,
    options: ReportParams & Links
) => {
    const reportBaseUrl = `${fqdn}/reports/${options.teamId}/${options.projectId}`;
    const buttons = [
        {
            id: "back_button",
            name: "To Project",
            href: `${fqdn}/project/${options.projectId}`,
        },
        {
            id: "next_button",
            name: "Next Report",
            href:
                options.nextRunId &&
                `${reportBaseUrl}/${options.nextRunId}/index.html`,
        },
        {
            id: "prev_button",
            name: "Prev Report",
            href:
                options.prevRunId &&
                `${reportBaseUrl}/${options.prevRunId}/index.html`,
        },
    ];

    const createdButtons = buttons.map((button) => ({
        id: button.id,
        content: createButton(button.id, button.name, button.href),
    }));

    const buttonContent = createdButtons.map((b) => b.content).join("\n");
    const appendButtons = createdButtons
        .map((b) => `buttonGroup.appendChild(${b.id});`)
        .join("\n");

    const addButton = `
    <script>
        const buttonGroup = document.createElement('div');

        ${buttonContent}
        ${appendButtons}
        
        const body = document.querySelector('body');
        body.prepend(buttonGroup);
    </script>
    `;

    return `${content}\n${addButton}`;
};

export async function GET(
    req: NextRequest,
    {
        params,
    }: {
        params: ReportParams;
    }
) {
    const session = await auth();
    if (!session?.user?.id) {
        redirect("/api/auth/signin?callbackUrl=" + req.url);
    }

    const { teamId, projectId, runId, filePath } = params;

    const hasAccess = await userIsTeamMember(session.user.id, params.teamId);

    if (!hasAccess) {
        return NextResponse.json(
            { error: "You do not have access to this team" },
            { status: 403 }
        );
    }

    const targetPath = path.join(
        process.cwd(),
        "reports",
        teamId,
        projectId,
        runId,
        ...(filePath ?? [])
    );

    try {
        await fs.access(targetPath);
        const content = await fs.readFile(targetPath, "utf-8");
        const links = (await getRunNeighbors(runId)) ?? {};
        return new Response(
            addNav(content, env.AUTH_URL, {
                ...params,
                ...links,
            }),
            {
                headers: { "Content-Type": "text/html" },
            }
        );
    } catch (error) {
        return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }
}
