export type SelectedOption = {
    stepId: number;
    stepName: string;
    optionId: number | null;
    optionName: string | null;
    valueText: string | null;
};

export type EarSelections = Record<number, SelectedOption[]>;
