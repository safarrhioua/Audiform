using Application.Interfaces;
using Domain.Entities;
using Npgsql;

namespace Infrastructure.Persistence;

public sealed class ShopRestrictionRepository(NpgsqlDataSource dataSource) : IShopRestrictionRepository
{
    public async Task<IReadOnlySet<int>> GetBlockedTemplateIdsAsync(
        int shopId,
        CancellationToken cancellationToken = default)
    {
        const string sql = """
            SELECT template_id
            FROM shop_blocked_templates
            WHERE shop_id = @shopId;
            """;

        await using var command = dataSource.CreateCommand(sql);
        command.Parameters.AddWithValue("shopId", shopId);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);

        var blockedTemplateIds = new HashSet<int>();
        while (await reader.ReadAsync(cancellationToken))
        {
            blockedTemplateIds.Add(reader.GetInt32(0));
        }

        return blockedTemplateIds;
    }

    public async Task<IReadOnlyList<BlockedOption>> GetShopBlockedOptionsAsync(
        int shopId,
        CancellationToken cancellationToken = default)
    {
        const string sql = """
            SELECT shop_id, step_id, option_id
            FROM shop_blocked_options
            WHERE shop_id = @shopId;
            """;

        await using var command = dataSource.CreateCommand(sql);
        command.Parameters.AddWithValue("shopId", shopId);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);

        var blockedOptions = new List<BlockedOption>();
        while (await reader.ReadAsync(cancellationToken))
        {
            blockedOptions.Add(new BlockedOption
            {
                ShopId = reader.GetInt32(0),
                StepId = reader.GetInt32(1),
                OptionId = reader.GetInt32(2),
            });
        }

        return blockedOptions;
    }
}
