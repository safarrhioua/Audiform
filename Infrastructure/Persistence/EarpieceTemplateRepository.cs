using Application.Interfaces;
using Domain.Entities;
using Npgsql;

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
}
