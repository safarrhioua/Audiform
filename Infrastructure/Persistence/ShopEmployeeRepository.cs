using Application.Interfaces;
using Npgsql;

namespace Infrastructure.Persistence;

public sealed class ShopEmployeeRepository(NpgsqlDataSource dataSource) : IShopEmployeeRepository
{
    public async Task<int?> GetShopIdByUserIdAsync(
        string userId,
        CancellationToken cancellationToken = default)
    {
        const string sql = """
                           SELECT "shop_id"
                           FROM "shop_employees"
                           WHERE "AspNetUsers_Id" = @userId
                           LIMIT 1;
                           """;

        await using var command = dataSource.CreateCommand(sql);
        command.Parameters.AddWithValue("userId", userId);

        var result = await command.ExecuteScalarAsync(cancellationToken);

        return result is null or DBNull ? null : (int)result;
    }

    public async Task<int?> GetShopEmployeeIdByUserIdAsync(
        string userId,
        CancellationToken cancellationToken = default)
    {
        const string sql = """
                           SELECT "id"
                           FROM "shop_employees"
                           WHERE "AspNetUsers_Id" = @userId
                           LIMIT 1;
                           """;

        await using var command = dataSource.CreateCommand(sql);
        command.Parameters.AddWithValue("userId", userId);

        var result = await command.ExecuteScalarAsync(cancellationToken);

        return result is null or DBNull ? null : (int)result;
    }
}
