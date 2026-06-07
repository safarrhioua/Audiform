export interface TemplateOption {
    id: number;
    name: string;
    optionId?: number;
    label?: string;
    value?: string;
    visibleWhenAny?: {
        stepId: number;
        optionId: number;
    }[][];
    [key: string]: unknown;
}

export interface TemplateStep {
    stepId: number;
    name: string;
    type: 'single' | 'multi' | 'text' | string;
    order: number;
    required: boolean;
    minSelections: number;
    maxSelections: number;
    visibleWhenAny?: {
        stepId: number;
        optionId: number;
    }[][];
    id?: number;
    title?: string;
    label?: string;
    options?: TemplateOption[];
    [key: string]: unknown;
}

export interface EarpieceTemplateConfiguration {
    id: number;
    name: string;
    version: number;
    config: {
        steps?: TemplateStep[];
        [key: string]: unknown;
    };
}
