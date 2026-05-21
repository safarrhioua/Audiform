using System.Text.Json.Nodes;

namespace Application.EarpieceTemplates;

public sealed record EarpieceTemplateConfigDto(
    int Id,
    string Name,
    int Version,
    JsonNode Config);
