import { useEffect, useState } from 'react';
import type { EarpieceTemplate } from '../types/EarpieceTemplate';

const TEMPLATES_ENDPOINT = 'https://localhost:7050/api/earpiece-templates';

export function useTemplates(initialTemplates: EarpieceTemplate[] = []) {
    const [templates, setTemplates] = useState<EarpieceTemplate[]>(initialTemplates);
    const [templatesLoading, setTemplatesLoading] = useState(true);
    const [templatesError, setTemplatesError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function fetchTemplates() {
            try {
                setTemplatesLoading(true);
                setTemplatesError(null);

                const response = await fetch(TEMPLATES_ENDPOINT, {
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error('De producten konden niet worden opgehaald.');
                }

                const data: unknown = await response.json();

                if (!Array.isArray(data)) {
                    throw new Error('De producten konden niet worden verwerkt.');
                }

                if (isMounted) {
                    setTemplates(data as EarpieceTemplate[]);
                }
            } catch (fetchError) {
                if (isMounted) {
                    setTemplatesError(
                        fetchError instanceof Error
                            ? fetchError.message
                            : 'Er ging iets mis bij het ophalen van de producten.',
                    );
                }
            } finally {
                if (isMounted) {
                    setTemplatesLoading(false);
                }
            }
        }

        void fetchTemplates();

        return () => {
            isMounted = false;
        };
    }, []);

    return {
        templates,
        templatesLoading,
        templatesError,
    };
}
