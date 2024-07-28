import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { validateApiKey } from "~/server/queries";

export async function verifyApiKey(request: NextRequest, teamId: string) {
    if (!teamId) {
        return {
            error: NextResponse.json(
                { error: "Team ID not found" },
                { status: 400 }
            ),
        };
    }

    const apiKey = request.headers.get("X-API-Key");

    if (!apiKey) {
        return {
            error: NextResponse.json(
                { error: "API key is not provided" },
                { status: 400 }
            ),
        };
    }

    const { isValid, apiKeyName } = await validateApiKey(apiKey, teamId);

    if (!isValid) {
        return {
            error: NextResponse.json(
                { error: "Invalid API key" },
                { status: 401 }
            ),
        };
    }

    return {
        apiKeyName,
    };
}
