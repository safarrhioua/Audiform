using Application.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Orders;

public interface IUpdateOrderStatusService
{
    Task UpdateAsync(int orderId, string newStatus, CancellationToken cancellationToken = default);
}

public sealed class UpdateOrderStatusService(
    IOrderRepository orderRepository) : IUpdateOrderStatusService
{
    private static readonly IReadOnlyList<string> ValidStatuses =
        ["nieuw", "ontvangen", "in productie", "gereed", "verzonden"];

    public async Task UpdateAsync(
        int orderId,
        string newStatus,
        CancellationToken cancellationToken = default)
    {
        if (!ValidStatuses.Contains(newStatus))
            throw new ArgumentException(
                $"Ongeldige status '{newStatus}'. Geldige waarden: {string.Join(", ", ValidStatuses)}");

        await orderRepository.UpdateOrderStatusAsync(orderId, newStatus, cancellationToken);
    }
}