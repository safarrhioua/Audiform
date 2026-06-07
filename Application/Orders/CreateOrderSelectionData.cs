namespace Application.Orders;

public sealed record CreateOrderSelectionData(
    string EarSide,
    int StepId,
    string? StepName,
    int? OptionId,
    string? OptionName,
    string? ValueText);
