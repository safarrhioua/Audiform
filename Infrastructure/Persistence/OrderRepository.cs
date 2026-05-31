using Application.Interfaces;
using Domain.Entities;
using Npgsql;

namespace Infrastructure.Persistence;

public sealed class OrderRepository(NpgsqlDataSource dataSource) : IOrderRepository
{
    public async Task<IReadOnlyList<Order>> GetAllOrdersAsync(
        CancellationToken cancellationToken = default)
    {
        const string sql = """
            SELECT id, shop_order_id, patient_name, patient_number, order_date, delivery_date, status
            FROM orders
            ORDER BY id;
            """;

        await using var command = dataSource.CreateCommand(sql);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);

        var orders = new List<Order>();
        while (await reader.ReadAsync(cancellationToken))
        {
            orders.Add(new Order
            {
                Id = reader.GetInt32(0),
                OrderNumber = reader.IsDBNull(1) ? null : reader.GetString(1),
                PatientName = reader.IsDBNull(2) ? null : reader.GetString(2),
                PatientNumber = reader.IsDBNull(3) ? null : reader.GetString(3),
                OrderDate = reader.IsDBNull(4) ? null : reader.GetDateTime(4),
                DeliveryDate = reader.IsDBNull(5) ? null : reader.GetDateTime(5),
                Status = reader.IsDBNull(6) ? null : reader.GetString(6),
            });
        }

        return orders;
    }
}