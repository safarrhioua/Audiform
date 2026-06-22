import { useEffect, useState } from 'react';
import type { EarpieceTemplateConfiguration } from '../types/EarpieceTemplateConfiguration';


const TEMPLATES_ENDPOINT = new URL('https://localhost:7050/api/earpiece-templates/');

function createTemplateConfigurationUrl(templateId: number): URL {
    if (!Number.isInteger(templateId) || templateId <= 0) {
        throw new Error('Ongeldig template-id.');
    }

    return new URL(`${templateId}/configuration`, TEMPLATES_ENDPOINT);
}

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
            setConfiguration(null);
            return;
        }

        const controller = new AbortController();

        async function fetchConfiguration() {
            try {
                setConfigurationLoading(true);
                setConfigurationError(null);

                const configurationUrl = createTemplateConfigurationUrl(templateId);

                const response = await fetch(configurationUrl, {
                    credentials: 'include',
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error(`De configuratie voor ${sideLabel} kon niet worden opgehaald.`);
                }

                const data = (await response.json()) as EarpieceTemplateConfiguration;
                setConfiguration(data);
            } catch (fetchError) {
                if (controller.signal.aborted) {
                    return;
                }

                setConfiguration(null);
                setConfigurationError(
                    fetchError instanceof Error
                        ? fetchError.message
                        : `Er ging iets mis bij het ophalen van de configuratie voor ${sideLabel}.`,
                );
            } finally {
                if (!controller.signal.aborted) {
                    setConfigurationLoading(false);
                }
            }
        }

        void fetchConfiguration();

        return () => {
            controller.abort();
        };
    }, [sideLabel, templateId]);

    return {
        configuration: templateId ? configuration : null,
        configurationLoading: templateId ? configurationLoading : false,
        configurationError: templateId ? configurationError : null,
    };
}