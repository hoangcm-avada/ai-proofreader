import { GitBookSpace, GitBookPage, GitBookOrganization } from '../types';

const GITBOOK_API_BASE = 'https://api.gitbook.com';

const gitbookEndpoints = {
    user: () => '/v1/user', // Added for token validation
    spaces: () => '/v1/spaces',
    spaceContent: (spaceId: string) => `/v1/spaces/${spaceId}/content`,
    pageContent: (spaceId: string, pageId: string) => `/v1/spaces/${spaceId}/pages/${pageId}`,
};


interface GitBookListResponse<T> {
    items: T[];
    next?: {
        page: string;
    };
}

// A generic fetcher for GitBook API with standardized error handling
async function fetchFromGitBook<T>(apiKey: string, endpoint: string): Promise<T> {
    const response = await fetch(`${GITBOOK_API_BASE}${endpoint}`, {
        headers: {
            'Authorization': `Bearer ${apiKey}`,
        },
    });

    if (!response.ok) {
        let errorMessage = `GitBook API Error: ${response.status} ${response.statusText}`;
        try {
            const errorBody = await response.json();
            errorMessage = errorBody.error?.message || errorMessage;
        } catch (e) {
            // Response might not have a JSON body, so we ignore parse errors.
        }
        if (response.status === 401) {
            throw new Error(`401: ${errorMessage}`);
        }
        if (response.status === 404) {
             throw new Error(`404: ${errorMessage}`);
        }
        throw new Error(errorMessage);
    }

    return response.json() as Promise<T>;
}

// A helper to handle paginated API responses
async function fetchAllPaginated<T>(apiKey: string, initialUrl: string): Promise<T[]> {
    const allItems: T[] = [];
    let pageToken: string | undefined = undefined;

    do {
        const url = new URL(`${GITBOOK_API_BASE}${initialUrl}`);
        if (pageToken) {
            url.searchParams.set('page', pageToken);
        }
        const response = await fetchFromGitBook<GitBookListResponse<T>>(apiKey, `${url.pathname}${url.search}`);
        allItems.push(...response.items);
        pageToken = response.next?.page;
    } while (pageToken);

    return allItems;
}

// Re-architected connection function with two-step validation
export const connectAndFetchContent = async (apiKey: string): Promise<{ organizations: GitBookOrganization[], spacesByOrgId: Record<string, GitBookSpace[]> }> => {
    // Step 1: Validate the token is fundamentally correct by fetching the user profile.
    try {
        await fetchFromGitBook(apiKey, gitbookEndpoints.user());
    } catch (error) {
        console.error("GitBook token validation failed:", error);
        if (error instanceof Error && error.message.includes("401")) {
            throw new Error("Invalid GitBook API Key. Please check that the token is correct and has not expired.");
        }
        throw new Error("Could not validate the API key with GitBook. The service may be temporarily unavailable or the token is invalid.");
    }

    // Step 2: If the token is valid, fetch the spaces. An error here is likely a permissions/scope issue.
    try {
        const allSpaces = await fetchAllPaginated<GitBookSpace & { organization: GitBookOrganization }>(apiKey, gitbookEndpoints.spaces());

        if (allSpaces.length === 0) {
            throw new Error("Connection successful, but no documentation spaces were found. This can happen if the token has correct permissions but is not associated with any spaces.");
        }

        const organizationsMap = new Map<string, GitBookOrganization>();
        const spacesByOrgId: Record<string, GitBookSpace[]> = {};

        // Process the flat list of spaces to build the hierarchy
        allSpaces.forEach(space => {
            const org = space.organization;
            if (org) {
                // Add organization to our map if it's new
                if (!organizationsMap.has(org.id)) {
                    organizationsMap.set(org.id, { id: org.id, title: org.title });
                }
                // Add space to the corresponding organization group
                if (!spacesByOrgId[org.id]) {
                    spacesByOrgId[org.id] = [];
                }
                spacesByOrgId[org.id].push({ id: space.id, title: space.title });
            }
        });

        const organizations = Array.from(organizationsMap.values()).sort((a, b) => a.title.localeCompare(b.title));

        return { organizations, spacesByOrgId };
    } catch (error) {
        console.error("Failed to fetch GitBook spaces after successful token validation:", error);
        if (error instanceof Error) {
            // A 404 here specifically means the /spaces endpoint is not accessible, which is a classic permissions issue.
            if (error.message.includes("404") || error.message.includes("403")) {
                 throw new Error(
                    "[GITBOOK_SCOPE_ERROR] Your API token is valid, but lacks permissions to read spaces. This is expected for accounts on the GitBook Free plan, which does not allow API access to content. To enable this feature, please upgrade to a paid GitBook plan."
                );
            }
            throw error; // Re-throw other errors
        }
        throw new Error("An unknown error occurred while fetching spaces from GitBook.");
    }
};

// --- Functions below remain unchanged ---

interface GitBookPageItem {
    id: string;
    title: string;
    pages?: GitBookPageItem[];
}

interface GitBookSpaceContent {
    pages: GitBookPageItem[];
}

export const listPages = async (apiKey: string, space: GitBookSpace): Promise<GitBookPage[]> => {
    const contentResponse = await fetchFromGitBook<GitBookSpaceContent>(apiKey, gitbookEndpoints.spaceContent(space.id));
    
    const allPages: GitBookPage[] = [];
    
    const traversePages = (pages: GitBookPageItem[]) => {
        if (!pages) return;
        for (const page of pages) {
            allPages.push({
                id: page.id,
                title: page.title || 'Untitled Page',
                spaceId: space.id,
                spaceTitle: space.title,
            });
            if (page.pages && page.pages.length > 0) {
                traversePages(page.pages);
            }
        }
    };

    traversePages(contentResponse.pages || []);
    return allPages;
};

export const getPageContent = async (apiKey: string, spaceId: string, pageId: string): Promise<string> => {
    const pageResponse = await fetchFromGitBook<{ markdown: string }>(apiKey, gitbookEndpoints.pageContent(spaceId, pageId));
    return pageResponse.markdown;
};
