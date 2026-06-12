import type { EarSelections } from '../types/EarSelections';

export type OrderSelectionRequest = {
    ear_side: 'left' | 'right';
    step_id: number;
    option_id: number | null;
    value_text: string | null;
};

export type CreatedOrderSelection = {
    earSide: 'left' | 'right';
    stepId: number;
    stepName: string | null;
    optionId: number | null;
    optionName: string | null;
    valueText: string | null;
};

export function getOrderSelectionRequests(
    earSide: 'left' | 'right',
    selections: EarSelections,
): OrderSelectionRequest[] {
    return Object.values(selections).flatMap((stepSelections) =>
        stepSelections.map((selection) => ({
            ear_side: earSide,
            step_id: selection.stepId,
            option_id: selection.optionId,
            value_text: selection.valueText,
        })),
    );
}

export function getCreatedOrderSelectionRows(
    selections: CreatedOrderSelection[],
    earSide: 'left' | 'right',
) {
    return selections
        .filter((selection) => selection.earSide === earSide)
        .map((selection) => ({
            label: selection.stepName ?? `Stap ${selection.stepId}`,
            value: selection.valueText || selection.optionName || '-',
        }));
}

export function getSelectionRows(selections: EarSelections) {
    return Object.values(selections).flatMap((stepSelections) =>
        stepSelections.map((selection) => ({
            label: selection.stepName,
            value: selection.valueText || selection.optionName || '-',
        })),
    );
}
