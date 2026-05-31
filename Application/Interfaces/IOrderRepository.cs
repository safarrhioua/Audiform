using Domain.Entities;

namespace Application.Interfaces;

public interface IOrderRepository
{
    Task<IReadOnlyList<Order>> GetAllOrdersAsync(
        CancellationToken cancellationToken = default);
}