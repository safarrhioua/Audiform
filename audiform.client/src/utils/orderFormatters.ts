export function formatSendMethod(sendMethod: string | null) {
    if (sendMethod === 'digital') {
        return 'Digitaal versturen';
    }

    if (sendMethod === 'physical') {
        return 'Fysiek versturen';
    }

    return '-';
}

export function parseJsonResponse(responseText: string) {
    try {
        return JSON.parse(responseText);
    } catch {
        return { message: responseText };
    }
}
