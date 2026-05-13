using System.Text.Json.Nodes;

namespace Domain.Entities;

public sealed class EarpieceTemplateConfig
{
    public int Id { get; init; }

    public string Name { get; init; } = string.Empty;

    public int Version { get; init; }

    public JsonNode Config { get; init; } = new JsonObject();
}
