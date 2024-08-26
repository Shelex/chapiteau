import mime from "mime";
import { redirect } from "next/navigation";
import { type NextRequest, NextResponse } from "next/server";
import path from "path";

import { auth } from "~/auth";
import { env } from "~/env";
import { getRunNeighbors, verifyMembership } from "~/server/queries";
import { reportHandler } from "~/server/reports";

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
    const reportBaseUrl = `${fqdn}/api/report/${options.teamId}/${options.projectId}`;
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

    const file = Array.isArray(filePath) ? filePath.join("/") : filePath ?? "";

    const { isMember } = await verifyMembership(session.user.id, params.teamId);

    if (!isMember) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const targetPath = path.join(teamId, projectId, runId, file);

    try {
        const contentType = mime.getType(path.basename(targetPath));

        if (!contentType && !path.extname(targetPath)) {
            return NextResponse.next();
        }

        const { result: content, error } = await reportHandler.read(
            targetPath,
            contentType
        );

        if (error ?? !content) {
            return NextResponse.json(
                { error: `Could not read file ${error?.message ?? ""}` },
                { status: 404 }
            );
        }

        const headers = {
            headers: {
                "Content-Type": contentType ?? "application/octet-stream",
            },
        };

        // set navigation buttons for main page
        if (
            contentType === "text/html" &&
            targetPath.includes(`${runId}/index.html`)
        ) {
            const links =
                (await getRunNeighbors(projectId, Number(runId))) ?? {};

            return new Response(
                addNav(content.toString(), env.NEXT_PUBLIC_AUTH_URL, {
                    ...params,
                    ...links,
                }),
                headers
            );
        }

        return new Response(content, headers);
    } catch (error) {
        return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }
}
