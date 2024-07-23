import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { auth } from "~/auth";
import { env } from "~/env";
import { redirect } from "next/navigation";

const addNav = (content: string, fqdn: string, projectId: string) => {
    const addButton = `
    <script >
        const button = document.createElement('button');
        button.textContent = 'To Project';
        button.id = 'backToDashboard';
        button.style.padding = '10px 20px';
        button.style.margin = '10px 0px 0px 25px';
        button.style.fontSize = '14px';
        function handleClick() {
            window.location.href = '${fqdn}/project/${projectId}';
        };

        button.addEventListener('click', handleClick);
        const body = document.querySelector('body');
        body.prepend(button);
    </script>
    `;

    return `${content}\n${addButton}`;
};

export async function GET(
    req: Request,
    {
        params,
    }: {
        params: {
            teamId: string;
            projectId: string;
            runId: string;
            filepath?: string[];
        };
    }
) {
    const session = await auth();
    if (!session?.user?.id) {
        redirect("/api/auth/signin?callbackUrl=" + req.url);
    }

    const { teamId, projectId, runId, filepath } = params;

    const filePath = path.join(
        process.cwd(),
        "reports",
        teamId,
        projectId,
        runId,
        ...(filepath ?? [])
    );

    try {
        const stats = await fs.stat(filePath);

        if (stats.isDirectory()) {
            // If it's a directory, look for an index.html file
            const indexPath = path.join(filePath, "index.html");
            try {
                await fs.access(indexPath);
                const content = await fs.readFile(indexPath, "utf-8");
                return new Response(addNav(content, env.AUTH_URL, projectId), {
                    headers: { "Content-Type": "text/html" },
                });
            } catch (error) {
                return NextResponse.json(
                    { error: "Index file not found" },
                    { status: 404 }
                );
            }
        }

        const content = await fs.readFile(filePath);
        const contentType = getContentType(filePath);
        return new Response(content, {
            headers: { "Content-Type": contentType },
        });
    } catch (error) {
        return NextResponse.json(
            { error: "File or directory not found" },
            { status: 404 }
        );
    }
}

function getContentType(filePath: string) {
    const ext = path.extname(filePath).toLowerCase();
    const types: Record<string, string> = {
        ".html": "text/html",
        ".css": "text/css",
        ".js": "text/javascript",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".gif": "image/gif",
    };
    return types?.[ext] ?? "application/octet-stream";
}
