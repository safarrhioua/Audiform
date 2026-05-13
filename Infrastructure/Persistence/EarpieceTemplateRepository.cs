using Application.Interfaces;
using Domain.Entities;
using Npgsql;
using System.Text.Json.Nodes;

namespace Infrastructure.Persistence;

public sealed class EarpieceTemplateRepository(NpgsqlDataSource dataSource) : IEarpieceTemplateRepository
{
    public async Task<IReadOnlyList<EarpieceTemplate>> GetAllTemplatesAsync(
        CancellationToken cancellationToken = default)
    {
        const string sql = """
            SELECT id, name, version
            FROM earpiece_templates
            ORDER BY id;
            """;

        await using var command = dataSource.CreateCommand(sql);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);

        var templates = new List<EarpieceTemplate>();
        while (await reader.ReadAsync(cancellationToken))
        {
            templates.Add(new EarpieceTemplate
            {
                Id = reader.GetInt32(0),
                Name = reader.GetString(1),
                Version = reader.GetInt32(2),
            });
        }

        return templates;
    }

    public async Task<EarpieceTemplateConfig?> GetConfigByTemplateIdAsync(
        int templateId,
        CancellationToken cancellationToken = default)
    {
        const string sql = """
            SELECT id, name, version, config
            FROM earpiece_templates
            WHERE id = @templateId
            LIMIT 1;
            """;

        await using var command = dataSource.CreateCommand(sql);
        command.Parameters.AddWithValue("templateId", templateId);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);

        if (!await reader.ReadAsync(cancellationToken))
        {
            return null;
        }

        var configJson = reader.GetString(3);

        return new EarpieceTemplateConfig
        {
            Id = reader.GetInt32(0),
            Name = reader.GetString(1),
            Version = reader.GetInt32(2),
            Config = JsonNode.Parse(configJson) ?? new JsonObject(),
        };
    }
}
