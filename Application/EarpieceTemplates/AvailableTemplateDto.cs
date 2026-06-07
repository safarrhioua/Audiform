namespace Application.EarpieceTemplates;

public sealed record AvailableTemplateDto(
    int Id,
    string Name,
    string? Description,
    string? ImagePath,
    int Version);
