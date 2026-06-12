import { useMemo, useState } from 'react';
import { Alert, Box, Button, CircularProgress, Paper } from '@mui/material';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import EarConfigurationCard from '../components/configuratie/EarConfigurationCard';
import ProductDetails from '../components/configuratie/ProductDetails';
import ProductImage from '../components/configuratie/ProductImage';
import { useEarConfigurationSelections } from '../hooks/useEarConfigurationSelections';
import { useTemplateConfiguration } from '../hooks/useTemplateConfiguration';
import { useTemplates } from '../hooks/useTemplates';
import type { EarSelections } from '../types/EarSelections';
import type { EarpieceTemplate } from '../types/EarpieceTemplate';
import { getMissingRequiredStepIds } from '../utils/requiredStepValidationUtils';
import { getVisibleConfiguration } from '../utils/visibleConfigurationUtils';

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

    const { templates, templatesLoading, templatesError } = useTemplates(
        template ? [template] : [],
    );
    const [rightTemplateId, setRightTemplateId] = useState<number | undefined>(
        hasRightTemplateState ? locationState.rightTemplateId : initialTemplateId,
    );
    const [leftTemplateId, setLeftTemplateId] = useState<number | undefined>(
        hasLeftTemplateState ? locationState.leftTemplateId : initialTemplateId,
    );
    const {
        rightSelections,
        leftSelections,
        setRightSelections,
        setLeftSelections,
        handleSingleSelectionChange,
        handleMultiSelectionToggle,
        handleTextSelectionChange,
    } = useEarConfigurationSelections(
        locationState.rightSelections ?? {},
        locationState.leftSelections ?? {},
    );
    const [validationAttempted, setValidationAttempted] = useState(false);

    const rightConfiguration = useTemplateConfiguration(rightTemplateId, 'rechts');
    const leftConfiguration = useTemplateConfiguration(leftTemplateId, 'links');

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
        () => getVisibleConfiguration(rightConfiguration.configuration, rightSelections),
        [rightConfiguration.configuration, rightSelections],
    );

    const visibleLeftConfiguration = useMemo(
        () => getVisibleConfiguration(leftConfiguration.configuration, leftSelections),
        [leftConfiguration.configuration, leftSelections],
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
    const hasSelectedTemplate = Boolean(rightTemplateId || leftTemplateId);

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
                ← Terug naar producten
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
                    loading={rightConfiguration.configurationLoading}
                    error={rightConfiguration.configurationError}
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
                    loading={leftConfiguration.configurationLoading}
                    error={leftConfiguration.configurationError}
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
                <Button
                    variant="contained"
                    onClick={handleContinueToOrder}
                    disabled={!hasSelectedTemplate}
                >
                    Bestelling afronden
                </Button>
            </Box>
        </Box>
    );
}
