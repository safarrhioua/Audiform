export async function getErrorMessage(
    response: Response,
    fallback: string
): Promise<string> {
    const text = await response.text();

    if (text) {
        return text;
    }

    switch (response.status) {
        case 401:
            return "Je bent niet ingelogd. Log opnieuw in.";

        case 403:
            return "Je hebt geen rechten om deze actie uit te voeren.";

        case 404:
            return "De gevraagde gegevens zijn niet gevonden.";

        default:
            if (response.status >= 500) {
                return "Er ging iets mis op de server. Probeer het later opnieuw.";
            }

            return fallback;
    }
}