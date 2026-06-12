import { useEffect, useState } from 'react';
import type { EarpieceTemplateConfiguration } from '../types/EarpieceTemplateConfiguration';

const TEMPLATES_ENDPOINT = 'https://localhost:7050/api/earpiece-templates';

export function useTemplateConfiguration(
    templateId: number | undefined,
    sideLabel: 'rechts' | 'links',
) {
    const [configuration, setConfiguration] =
        useState<EarpieceTemplateConfiguration | null>(null);
    const [configurationLoading, setConfigurationLoading] = useState(false);
    const [configurationError, setConfigurationError] = useState<string | null>(null);

    useEffect(() => {
        if (!templateId) {
            return;
        }

        let isMounted = true;

        async function fetchConfiguration() {
            try {
                setConfigurationLoading(true);
                setConfigurationError(null);

                const response = await fetch(
                    `${TEMPLATES_ENDPOINT}/${templateId}/configuration`,
                    { credentials: 'include' },
                );

                if (!response.ok) {
                    throw new Error(`De configuratie voor ${sideLabel} kon niet worden opgehaald.`);
                }

                const data = (await response.json()) as EarpieceTemplateConfiguration;

                if (isMounted) {
                    setConfiguration(data);
                }
            } catch (fetchError) {
                if (isMounted) {
                    setConfiguration(null);
                    setConfigurationError(
                        fetchError instanceof Error
                            ? fetchError.message
                            : `Er ging iets mis bij het ophalen van de configuratie voor ${sideLabel}.`,
                    );
                }
            } finally {
                if (isMounted) {
                    setConfigurationLoading(false);
                }
            }
        }

        void fetchConfiguration();

        return () => {
            isMounted = false;
        };
    }, [sideLabel, templateId]);

    return {
        configuration: templateId ? configuration : null,
        configurationLoading: templateId ? configurationLoading : false,
        configurationError: templateId ? configurationError : null,
    };
}
