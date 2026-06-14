import type { EarSelections } from '../types/EarSelections';
import type {
    EarpieceTemplateConfiguration,
    TemplateStep,
} from '../types/EarpieceTemplateConfiguration';

export function isRequiredStepFilled(step: TemplateStep, selections: EarSelections) {
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

export function getMissingRequiredStepIds(
    configuration: EarpieceTemplateConfiguration | null,
    selections: EarSelections,
) {
    return (configuration?.config.steps ?? [])
        .filter((step) => step.required && !isRequiredStepFilled(step, selections))
        .map((step) => step.stepId);
}
