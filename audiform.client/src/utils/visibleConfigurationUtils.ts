import type { EarSelections } from '../types/EarSelections';
import type {
    EarpieceTemplateConfiguration,
    TemplateOption,
    TemplateStep,
} from '../types/EarpieceTemplateConfiguration';

export function matchesVisibleWhenAny(
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

export function getVisibleConfiguration(
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
