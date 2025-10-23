
export const getGoogleDocContent = async (url: string): Promise<{ title: string, content: string }> => {
    // Regex to extract the document ID from various Google Doc URL formats
    const match = url.match(/document\/d\/([a-zA-Z0-9-_]+)/);
    if (!match || !match[1]) {
        throw new Error("Invalid Google Doc URL. Please make sure it's a valid document link.");
    }
    const docId = match[1];

    // Use the export format to get the raw text content
    const exportUrl = `https://docs.google.com/document/d/${docId}/export?format=txt`;

    try {
        const response = await fetch(exportUrl);

        if (!response.ok) {
             if (response.status === 404) {
                 throw new Error("Document not found. Please check the URL and make sure the document is shared publicly ('Anyone with the link can view').");
            }
            throw new Error(`Failed to fetch the document. Server responded with status: ${response.status}`);
        }
        
        // Attempt to get the document title from the content-disposition header
        let title = 'Google Doc';
        const disposition = response.headers.get('content-disposition');
        if (disposition) {
            const titleMatch = disposition.match(/filename\*?=['"]?(?:UTF-\d['"]*)?([^;\r\n"']+)/);
            if (titleMatch && titleMatch[1]) {
                // Decode URI component and remove the .txt extension
                title = decodeURIComponent(titleMatch[1]).replace(/\.txt$/, '');
            }
        }

        const content = await response.text();
        return { title, content };
    } catch (error) {
        console.error("Error fetching Google Doc:", error);
        if (error instanceof Error) {
            throw error; // Re-throw known errors
        }
        throw new Error("A network error occurred while trying to fetch the document. Please check your connection.");
    }
};
