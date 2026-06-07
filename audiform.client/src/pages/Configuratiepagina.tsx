import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, CircularProgress, Paper } from '@mui/material';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import EarConfigurationCard from '../components/configuratie/EarConfigurationCard';
import ProductDetails from '../components/configuratie/ProductDetails';
import ProductImage from '../components/configuratie/ProductImage';
import type { EarSelections, SelectedOption } from '../types/EarSelections';
import type { EarpieceTemplate } from '../types/EarpieceTemplate';
import type {
    EarpieceTemplateConfiguration,
    TemplateOption,
    TemplateStep,
} from '../types/EarpieceTemplateConfiguration';

const API_BASE_URL = 'https://localhost:7050';
const TEMPLATES_ENDPOINT = `${API_BASE_URL}/api/earpiece-templates`;

interface ConfiguratieLocationState {
    template?: EarpieceTemplate;
    rightTemplateId?: number;
    leftTemplateId?: number;
    rightSelections?: EarSelections;
    leftSelections?: EarSelections;
}

export default function Configuratiepagina() {
    const navigate = useNavigate();
    const { templateId } = useParams();
    const location = useLocation();
    const locationState = (location.state ?? {}) as ConfiguratieLocationState;
    const { template } = locationState;
    const initialTemplateId = template?.id ?? (templateId ? Number(templateId) : undefined);
    const hasRightTemplateState = Object.prototype.hasOwnProperty.call(
        locationState,
        'rightTemplateId',
    );
    const hasLeftTemplateState = Object.prototype.hasOwnProperty.call(
        locationState,
        'leftTemplateId',
    );

    const [templates, setTemplates] = useState<EarpieceTemplate[]>(template ? [template] : []);
    const [templatesLoading, setTemplatesLoading] = useState(true);
    const [templatesError, setTemplatesError] = useState<string | null>(null);
    const [rightTemplateId, setRightTemplateId] = useState<number | undefined>(
        hasRightTemplateState ? locationState.rightTemplateId : initialTemplateId,
    );
    const [leftTemplateId, setLeftTemplateId] = useState<number | undefined>(
        hasLeftTemplateState ? locationState.leftTemplateId : initialTemplateId,
    );
    const [rightConfiguration, setRightConfiguration] =
        useState<EarpieceTemplateConfiguration | null>(null);
    const [leftConfiguration, setLeftConfiguration] =
        useState<EarpieceTemplateConfiguration | null>(null);
    const [rightConfigurationLoading, setRightConfigurationLoading] = useState(false);
    const [leftConfigurationLoading, setLeftConfigurationLoading] = useState(false);
    const [rightConfigurationError, setRightConfigurationError] = useState<string | null>(null);
    const [leftConfigurationError, setLeftConfigurationError] = useState<string | null>(null);
    const [rightSelections, setRightSelections] = useState<EarSelections>(
        locationState.rightSelections ?? {},
    );
    const [leftSelections, setLeftSelections] = useState<EarSelections>(
        locationState.leftSelections ?? {},
    );
    const [validationAttempted, setValidationAttempted] = useState(false);

    function getOptionId(option: TemplateOption) {
        return option.id ?? option.optionId;
    }

    function getOptionName(option: TemplateOption) {
        return option.name ?? option.label ?? option.value ?? null;
    }

    function matchesVisibleWhenAny(
        item: TemplateStep | TemplateOption,
        selections: EarSelections,
    ) {
        if (!item.visibleWhenAny || item.visibleWhenAny.length === 0) {
            return true;
        }

        return item.visibleWhenAny.some((route) =>
            route.every((condition) => {
                const selectedStepOptions = selections[condition.stepId] ?? [];

                return selectedStepOptions.some(
                    (selectedOption) => selectedOption.optionId === condition.optionId,
                );
            }),
        );
    }

    function getVisibleConfiguration(
        configuration: EarpieceTemplateConfiguration | null,
        selections: EarSelections,
    ) {
        if (!configuration) {
            return null;
        }

        return {
            ...configuration,
            config: {
                ...configuration.config,
                steps: (configuration.config.steps ?? [])
                    .filter((step) => matchesVisibleWhenAny(step, selections))
                    .map((step) => {
                        if (!step.options) {
                            return step;
                        }

                        return {
                            ...step,
                            options: step.options.filter((option) =>
                                matchesVisibleWhenAny(option, selections),
                            ),
                        };
                    }),
            },
        };
    }

    function isRequiredStepFilled(step: TemplateStep, selections: EarSelections) {
        const stepSelections = selections[step.stepId] ?? [];

        if (step.type === 'single') {
            return stepSelections.some((selection) => selection.optionId !== null);
        }

        if (step.type === 'multi') {
            const minimumSelections = step.minSelections > 0 ? step.minSelections : 1;

            return stepSelections.length >= minimumSelections;
        }

        if (step.type === 'text') {
            return stepSelections.some((selection) => selection.valueText?.trim());
        }

        return true;
    }

    function getMissingRequiredStepIds(
        configuration: EarpieceTemplateConfiguration | null,
        selections: EarSelections,
    ) {
        return (configuration?.config.steps ?? [])
            .filter((step) => step.required && !isRequiredStepFilled(step, selections))
            .map((step) => step.stepId);
    }

    function updateSelections(
        earSide: 'right' | 'left',
        updater: (currentSelections: EarSelections) => EarSelections,
    ) {
        if (earSide === 'right') {
            setRightSelections(updater);
            return;
        }

        setLeftSelections(updater);
    }

    function handleSingleSelectionChange(
        earSide: 'right' | 'left',
        step: TemplateStep,
        optionId: number | null,
    ) {
        if (optionId === null) {
            updateSelections(earSide, (currentSelections) => {
                const nextSelections = { ...currentSelections };
                delete nextSelections[step.stepId];
                return nextSelections;
            });
            return;
        }

        const option = step.options?.find((availableOption) => getOptionId(availableOption) === optionId);

        if (!option) {
            return;
        }

        const selectedOption: SelectedOption = {
            stepId: step.stepId,
            stepName: step.name,
            optionId,
            optionName: getOptionName(option),
            valueText: null,
        };

        updateSelections(earSide, (currentSelections) => ({
            ...currentSelections,
            [step.stepId]: [selectedOption],
        }));
    }

    function handleMultiSelectionToggle(
        earSide: 'right' | 'left',
        step: TemplateStep,
        option: TemplateOption,
    ) {
        const optionId = getOptionId(option);

        if (optionId === undefined) {
            return;
        }

        updateSelections(earSide, (currentSelections) => {
            const currentStepSelections = currentSelections[step.stepId] ?? [];
            const isSelected = currentStepSelections.some(
                (selection) => selection.optionId === optionId,
            );

            if (isSelected) {
                return {
                    ...currentSelections,
                    [step.stepId]: currentStepSelections.filter(
                        (selection) => selection.optionId !== optionId,
                    ),
                };
            }

            if (step.maxSelections > 0 && currentStepSelections.length >= step.maxSelections) {
                return currentSelections;
            }

            const selectedOption: SelectedOption = {
                stepId: step.stepId,
                stepName: step.name,
                optionId,
                optionName: getOptionName(option),
                valueText: null,
            };

            return {
                ...currentSelections,
                [step.stepId]: [...currentStepSelections, selectedOption],
            };
        });
    }

    function handleTextSelectionChange(
        earSide: 'right' | 'left',
        step: TemplateStep,
        value: string,
    ) {
        updateSelections(earSide, (currentSelections) => ({
            ...currentSelections,
            [step.stepId]: [
                {
                    stepId: step.stepId,
                    stepName: step.name,
                    optionId: null,
                    optionName: null,
                    valueText: value,
                },
            ],
        }));
    }

    function handleContinueToOrder() {
        setValidationAttempted(true);

        if (missingRightRequiredStepIds.length > 0 || missingLeftRequiredStepIds.length > 0) {
            return;
        }

        navigate('/bestelling-afronden', {
            state: {
                template: displayedTemplate,
                rightTemplateId,
                leftTemplateId,
                rightSelections,
                leftSelections,
            },
        });
    }

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

    useEffect(() => {
        if (!rightTemplateId) {
            setRightConfiguration(null);
            setRightConfigurationError(null);
            setRightConfigurationLoading(false);
            return;
        }

        let isMounted = true;

        async function fetchRightConfiguration() {
            try {
                setRightConfigurationLoading(true);
                setRightConfigurationError(null);

                const response = await fetch(
                    `${TEMPLATES_ENDPOINT}/${rightTemplateId}/configuration`,
                    { credentials: 'include' },
                );

                if (!response.ok) {
                    throw new Error('De configuratie voor rechts kon niet worden opgehaald.');
                }

                const data = (await response.json()) as EarpieceTemplateConfiguration;

                if (isMounted) {
                    setRightConfiguration(data);
                }
            } catch (fetchError) {
                if (isMounted) {
                    setRightConfiguration(null);
                    setRightConfigurationError(
                        fetchError instanceof Error
                            ? fetchError.message
                            : 'Er ging iets mis bij het ophalen van de configuratie voor rechts.',
                    );
                }
            } finally {
                if (isMounted) {
                    setRightConfigurationLoading(false);
                }
            }
        }

        void fetchRightConfiguration();

        return () => {
            isMounted = false;
        };
    }, [rightTemplateId]);

    useEffect(() => {
        if (!leftTemplateId) {
            setLeftConfiguration(null);
            setLeftConfigurationError(null);
            setLeftConfigurationLoading(false);
            return;
        }

        let isMounted = true;

        async function fetchLeftConfiguration() {
            try {
                setLeftConfigurationLoading(true);
                setLeftConfigurationError(null);

                const response = await fetch(
                    `${TEMPLATES_ENDPOINT}/${leftTemplateId}/configuration`,
                    { credentials: 'include' },
                );

                if (!response.ok) {
                    throw new Error('De configuratie voor links kon niet worden opgehaald.');
                }

                const data = (await response.json()) as EarpieceTemplateConfiguration;

                if (isMounted) {
                    setLeftConfiguration(data);
                }
            } catch (fetchError) {
                if (isMounted) {
                    setLeftConfiguration(null);
                    setLeftConfigurationError(
                        fetchError instanceof Error
                            ? fetchError.message
                            : 'Er ging iets mis bij het ophalen van de configuratie voor links.',
                    );
                }
            } finally {
                if (isMounted) {
                    setLeftConfigurationLoading(false);
                }
            }
        }

        void fetchLeftConfiguration();

        return () => {
            isMounted = false;
        };
    }, [leftTemplateId]);

    const selectedRightTemplate = useMemo(
        () => templates.find((availableTemplate) => availableTemplate.id === rightTemplateId),
        [rightTemplateId, templates],
    );

    const selectedLeftTemplate = useMemo(
        () => templates.find((availableTemplate) => availableTemplate.id === leftTemplateId),
        [leftTemplateId, templates],
    );

    const displayedTemplate = useMemo(
        () => selectedRightTemplate ?? selectedLeftTemplate ?? template,
        [selectedLeftTemplate, selectedRightTemplate, template],
    );

    const visibleRightConfiguration = useMemo(
        () => getVisibleConfiguration(rightConfiguration, rightSelections),
        [rightConfiguration, rightSelections],
    );

    const visibleLeftConfiguration = useMemo(
        () => getVisibleConfiguration(leftConfiguration, leftSelections),
        [leftConfiguration, leftSelections],
    );

    const missingRightRequiredStepIds = useMemo(
        () => getMissingRequiredStepIds(visibleRightConfiguration, rightSelections),
        [rightSelections, visibleRightConfiguration],
    );

    const missingLeftRequiredStepIds = useMemo(
        () => getMissingRequiredStepIds(visibleLeftConfiguration, leftSelections),
        [leftSelections, visibleLeftConfiguration],
    );

    const hasMissingRequiredSteps =
        missingRightRequiredStepIds.length > 0 || missingLeftRequiredStepIds.length > 0;

    if (templatesLoading && templates.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (templatesError && templates.length === 0) {
        return <Alert severity="error">{templatesError}</Alert>;
    }

    return (
        <Box sx={{ maxWidth: 1120 }}>
            <Button
                variant="text"
                onClick={() => navigate('/bestelpagina')}
                sx={{
                    mb: 3,
                    color: 'text.primary',
                    textTransform: 'none',
                    px: 0,
                }}
            >
                Terug naar producten
            </Button>

            <Paper
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        md: 'minmax(280px, 480px) minmax(280px, 1fr)',
                    },
                    alignItems: 'center',
                    gap: { xs: 3, md: 4 },
                    p: 0,
                    mb: { xs: 4, md: 8 },
                    bgcolor: 'transparent',
                    boxShadow: 'none',
                }}
            >
                <ProductImage
                    imagePath={displayedTemplate?.imagePath ?? null}
                    name={displayedTemplate?.name ?? ''}
                />
                {displayedTemplate ? (
                    <ProductDetails template={displayedTemplate} />
                ) : (
                        <Alert severity="info">Kies een oorstukje om de productinformatie te tonen.</Alert>
                )}
            </Paper>

            {templatesError ? (
                <Alert severity="warning" sx={{ mt: 3 }}>
                    {templatesError}
                </Alert>
            ) : null}

            {validationAttempted && hasMissingRequiredSteps ? (
                <Alert severity="error" sx={{ mb: 3 }}>
                    Vul alle verplichte stappen in voordat u doorgaat.
                </Alert>
            ) : null}

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        md: 'repeat(2, minmax(0, 1fr))',
                    },
                    gap: { xs: 3, md: 4 },
                    alignItems: 'stretch',
                }}
            >
                <EarConfigurationCard
                    title="Rechts"
                    titleColor="secondary.main"
                    selectedTemplateId={rightTemplateId}
                    templates={templates}
                    configuration={visibleRightConfiguration}
                    loading={rightConfigurationLoading}
                    error={rightConfigurationError}
                    selections={rightSelections}
                    invalidStepIds={validationAttempted ? missingRightRequiredStepIds : []}
                    onTemplateChange={(newTemplateId) => {
                        setRightTemplateId(newTemplateId);
                        setRightSelections({});
                    }}
                    onSingleSelectionChange={(step, optionId) => {
                        handleSingleSelectionChange('right', step, optionId);
                    }}
                    onMultiSelectionToggle={(step, option) => {
                        handleMultiSelectionToggle('right', step, option);
                    }}
                    onTextSelectionChange={(step, value) => {
                        handleTextSelectionChange('right', step, value);
                    }}
                />
                <EarConfigurationCard
                    title="Links"
                    titleColor="primary.main"
                    selectedTemplateId={leftTemplateId}
                    templates={templates}
                    configuration={visibleLeftConfiguration}
                    loading={leftConfigurationLoading}
                    error={leftConfigurationError}
                    selections={leftSelections}
                    invalidStepIds={validationAttempted ? missingLeftRequiredStepIds : []}
                    onTemplateChange={(newTemplateId) => {
                        setLeftTemplateId(newTemplateId);
                        setLeftSelections({});
                    }}
                    onSingleSelectionChange={(step, optionId) => {
                        handleSingleSelectionChange('left', step, optionId);
                    }}
                    onMultiSelectionToggle={(step, option) => {
                        handleMultiSelectionToggle('left', step, option);
                    }}
                    onTextSelectionChange={(step, value) => {
                        handleTextSelectionChange('left', step, value);
                    }}
                />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button variant="contained" onClick={handleContinueToOrder}>
                    Bestelling afronden
                </Button>
            </Box>
        </Box>
    );
}
