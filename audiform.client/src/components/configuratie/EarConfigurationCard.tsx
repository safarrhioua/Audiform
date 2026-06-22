import {
    Alert,
    Box,
    Button,
    Checkbox,
    CircularProgress,
    FormControl,
    FormControlLabel,
    FormGroup,
    FormHelperText,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    TextField,
    Typography,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import type { EarSelections } from '../../types/EarSelections';
import type { EarpieceTemplate } from '../../types/EarpieceTemplate';
import type {
    EarpieceTemplateConfiguration,
    TemplateOption,
    TemplateStep,
} from '../../types/EarpieceTemplateConfiguration';

interface EarConfigurationCardProps {
    title: string;
    titleColor: string;
    selectedTemplateId: number | undefined;
    templates: EarpieceTemplate[];
    configuration: EarpieceTemplateConfiguration | null;
    loading: boolean;
    error: string | null;
    selections: EarSelections;
    invalidStepIds?: number[];
    copyAction?: {
        label: string;
        disabled: boolean;
        onClick: () => void;
    };
    onTemplateChange: (templateId: number | undefined) => void;
    onSingleSelectionChange: (step: TemplateStep, optionId: number | null) => void;
    onMultiSelectionToggle: (step: TemplateStep, option: TemplateOption) => void;
    onTextSelectionChange: (step: TemplateStep, value: string) => void;
}

function getStepTitle(step: TemplateStep, index: number) {
    return step.name ?? step.title ?? step.label ?? `Stap ${index + 1}`;
}

function getOptionLabel(option: TemplateOption, index: number) {
    return option.name ?? option.label ?? option.value ?? `Optie ${index + 1}`;
}

function getOptionId(option: TemplateOption) {
    return option.id ?? option.optionId;
}

function getRequiredLabel(stepTitle: string, required: boolean) {
    return (
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
            {stepTitle}
            {required ? (
                <Box component="span" sx={{ color: 'secondary.main', ml: 0.5 }}>
                    *
                </Box>
            ) : null}
        </Typography>
    );
}

export default function EarConfigurationCard({
    title,
    titleColor,
    selectedTemplateId,
    templates,
    configuration,
    loading,
    error,
    selections,
    invalidStepIds = [],
    copyAction,
    onTemplateChange,
    onSingleSelectionChange,
    onMultiSelectionToggle,
    onTextSelectionChange,
}: EarConfigurationCardProps) {
    function handleTemplateChange(event: SelectChangeEvent<string>) {
        const selectedValue = event.target.value;

        onTemplateChange(selectedValue === '' ? undefined : Number(selectedValue));
    }

    const steps = [...(configuration?.config.steps ?? [])].sort(
        (firstStep, secondStep) => firstStep.order - secondStep.order,
    );
    const invalidSteps = new Set(invalidStepIds);

    return (
        <Paper
            sx={{
                p: { xs: 2.5, md: 3 },
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: 'none',
                height: '100%',
            }}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: { xs: 'stretch', sm: 'center' },
                        justifyContent: 'space-between',
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: 1.5,
                    }}
                >
                    <Typography variant="h6" sx={{ fontWeight: 700, color: titleColor }}>
                        {title}
                    </Typography>
                    {copyAction ? (
                        <Button
                            variant="outlined"
                            size="small"
                            disabled={copyAction.disabled}
                            onClick={copyAction.onClick}
                            sx={{ textTransform: 'none', alignSelf: { xs: 'flex-start', sm: 'center' } }}
                        >
                            {copyAction.label}
                        </Button>
                    ) : null}
                </Box>

                <FormControl fullWidth size="small">
                    <InputLabel id={`${title}-template-label`}>Kies een oorstukje</InputLabel>
                    <Select
                        labelId={`${title}-template-label`}
                        label="Kies een oorstukje"
                        value={String(selectedTemplateId ?? '')}
                        onChange={handleTemplateChange}
                        sx={{
                            bgcolor: 'grey.100',
                            borderRadius: 1,
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'transparent',
                            },
                        }}
                    >
                        <MenuItem value="">
                            <em>Geen oorstukje</em>
                        </MenuItem>
                        {templates.map((template) => (
                            <MenuItem key={template.id} value={String(template.id)}>
                                {template.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress size={28} />
                    </Box>
                ) : error ? (
                    <Alert severity="error">{error}</Alert>
                ) : !selectedTemplateId ? (
                    <Alert severity="info">Kies eerst een oorstukje om de opties te tonen.</Alert>
                ) : steps.length === 0 ? (
                    <Alert severity="info">Geen configuratiestappen beschikbaar.</Alert>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25 }}>
                        {steps.map((step, stepIndex) => (
                            <Box
                                key={`${step.id ?? step.stepId ?? stepIndex}`}
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 1,
                                }}
                            >
                                {(() => {
                                    const isInvalid = invalidSteps.has(step.stepId);

                                    return (
                                        <>
                                {getRequiredLabel(getStepTitle(step, stepIndex), step.required)}

                                {step.type === 'single' ? (
                                    <FormControl fullWidth size="small" error={isInvalid}>
                                        <Select
                                            displayEmpty
                                            value={String(selections[step.stepId]?.[0]?.optionId ?? '')}
                                            onChange={(event) => {
                                                const selectedValue = event.target.value;
                                                onSingleSelectionChange(
                                                    step,
                                                    selectedValue === '' ? null : Number(selectedValue),
                                                );
                                            }}
                                            sx={{
                                                bgcolor: 'grey.100',
                                                borderRadius: 1,
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: 'transparent',
                                                },
                                            }}
                                            renderValue={(selected) => {
                                                if (!selected) {
                                                    return 'Select an option';
                                                }

                                                const selectedOption = step.options?.find(
                                                    (option) => getOptionId(option) === Number(selected),
                                                );

                                                return selectedOption
                                                    ? getOptionLabel(selectedOption, 0)
                                                    : 'Select an option';
                                            }}
                                        >
                                            <MenuItem value="">
                                                <em>
                                                    {step.required ? 'Selecteer een optie' : 'Geen keuze'}
                                                </em>
                                            </MenuItem>
                                            {(step.options ?? []).map((option, optionIndex) => {
                                                const optionId = getOptionId(option);

                                                return (
                                                    <MenuItem
                                                        key={`${optionId ?? optionIndex}`}
                                                        value={String(optionId)}
                                                    >
                                                        {getOptionLabel(option, optionIndex)}
                                                    </MenuItem>
                                                );
                                            })}
                                        </Select>
                                        {isInvalid ? (
                                            <FormHelperText>Deze stap is verplicht.</FormHelperText>
                                        ) : null}
                                    </FormControl>
                                ) : null}

                                {step.type === 'multi' ? (
                                    <FormControl component="fieldset" error={isInvalid}>
                                        <FormGroup>
                                            {(step.options ?? []).map((option, optionIndex) => {
                                                const optionId = getOptionId(option);
                                                const selectedOptions = selections[step.stepId] ?? [];
                                                const checked = selectedOptions.some(
                                                    (selection) => selection.optionId === optionId,
                                                );
                                                const maxReached =
                                                    step.maxSelections > 0 &&
                                                    selectedOptions.length >= step.maxSelections;

                                                return (
                                                    <FormControlLabel
                                                        key={`${optionId ?? optionIndex}`}
                                                        control={
                                                            <Checkbox
                                                                checked={checked}
                                                                disabled={!checked && maxReached}
                                                                onChange={() => {
                                                                    onMultiSelectionToggle(step, option);
                                                                }}
                                                            />
                                                        }
                                                        label={getOptionLabel(option, optionIndex)}
                                                    />
                                                );
                                            })}
                                        </FormGroup>
                                        {isInvalid ? (
                                            <FormHelperText>Deze stap is verplicht.</FormHelperText>
                                        ) : step.maxSelections > 0 ? (
                                            <FormHelperText>
                                                Maximaal {step.maxSelections} keuze
                                                {step.maxSelections === 1 ? '' : 's'}
                                            </FormHelperText>
                                        ) : null}
                                    </FormControl>
                                ) : null}

                                {step.type === 'text' ? (
                                    <TextField
                                        size="small"
                                        fullWidth
                                        multiline
                                        minRows={3}
                                        value={selections[step.stepId]?.[0]?.valueText ?? ''}
                                        onChange={(event) => {
                                            onTextSelectionChange(step, event.target.value);
                                        }}
                                        error={isInvalid}
                                        helperText={isInvalid ? 'Deze stap is verplicht.' : undefined}
                                        placeholder="Vul je opmerking in"
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                bgcolor: 'grey.100',
                                                borderRadius: 1,
                                                '& fieldset': {
                                                    borderColor: 'transparent',
                                                },
                                            },
                                        }}
                                    />
                                ) : null}

                                {!['single', 'multi', 'text'].includes(step.type) ? (
                                    <Alert severity="info">
                                        Staptype "{step.type}" wordt nog niet ondersteund.
                                    </Alert>
                                ) : null}
                                        </>
                                    );
                                })()}
                            </Box>
                        ))}
                    </Box>
                )}
            </Box>
        </Paper>
    );
}
