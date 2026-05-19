using Application.Interfaces;
using Npgsql;

namespace Infrastructure.Persistence;

public sealed class ShopEmployeeRepository(NpgsqlDataSource dataSource) : IShopEmployeeRepository
{
    public async Task<int?> GetShopIdByUserIdAsync(
        string userId,
        CancellationToken cancellationToken = default)
    {
        if (!int.TryParse(userId, out var numericUserId))
        {
            return null;
        }

        const string sql = """
            SELECT shop_id
            FROM shop_employees
            WHERE user_id = @userId
            LIMIT 1;
            """;

        await using var command = dataSource.CreateCommand(sql);
        command.Parameters.AddWithValue("userId", numericUserId);

        var result = await command.ExecuteScalarAsync(cancellationToken);
        return result is null or DBNull ? null : (int)result;
    }
}
