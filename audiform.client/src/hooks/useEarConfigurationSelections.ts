import { useState } from 'react';
import type { EarSelections, SelectedOption } from '../types/EarSelections';
import type {
    TemplateOption,
    TemplateStep,
} from '../types/EarpieceTemplateConfiguration';
import { getOptionId, getOptionName } from '../utils/templateOptionUtils';

type EarSide = 'right' | 'left';

export function useEarConfigurationSelections(
    initialRightSelections: EarSelections = {},
    initialLeftSelections: EarSelections = {},
) {
    const [rightSelections, setRightSelections] = useState<EarSelections>(
        initialRightSelections,
    );
    const [leftSelections, setLeftSelections] = useState<EarSelections>(
        initialLeftSelections,
    );

    function updateSelections(
        earSide: EarSide,
        updater: (currentSelections: EarSelections) => EarSelections,
    ) {
        if (earSide === 'right') {
            setRightSelections(updater);
            return;
        }

        setLeftSelections(updater);
    }

    function handleSingleSelectionChange(
        earSide: EarSide,
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
        earSide: EarSide,
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
        earSide: EarSide,
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

    return {
        rightSelections,
        leftSelections,
        setRightSelections,
        setLeftSelections,
        handleSingleSelectionChange,
        handleMultiSelectionToggle,
        handleTextSelectionChange,
        updateSelections,
    };
}
