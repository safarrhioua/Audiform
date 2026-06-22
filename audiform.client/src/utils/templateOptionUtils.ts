import type { TemplateOption } from '../types/EarpieceTemplateConfiguration';

export function getOptionId(option: TemplateOption) {
    return option.id ?? option.optionId;
}

export function getOptionName(option: TemplateOption) {
    return option.name ?? option.label ?? option.value ?? null;
}
