using System.Threading;
using System.Threading.Tasks;

namespace Application.Orders;

public interface IGetOrdersService
{
    Task<IReadOnlyList<OrderDto>> GetOrdersAsync(CancellationToken cancellationToken);
}