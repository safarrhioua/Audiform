using System.Threading;
using System.Threading.Tasks;

namespace Application.Orders;

public interface IGetOrdersService
{
    Task<IReadOnlyList<OrderDto>> GetOrdersAsync(string userId, CancellationToken cancellationToken);
    Task<IReadOnlyList<OrderDto>> SearchOrdersAsync(string userId, string query, CancellationToken cancellationToken);
}