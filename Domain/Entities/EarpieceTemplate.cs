namespace Domain.Entities;

public sealed class EarpieceTemplate
{
    public int Id { get; init; }

    public string Name { get; init; } = string.Empty;

    public int Version { get; init; }

    public string? Description { get; init; }

    public string? ImagePath { get; init; }
}
