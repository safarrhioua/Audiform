using Application.Interfaces;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Orders;

public sealed class GetOrdersService(
    IOrderRepository orderRepository) : IGetOrdersService
{
    public async Task<IReadOnlyList<OrderDto>> GetOrdersAsync(
        CancellationToken cancellationToken = default)
    {
        return await orderRepository.GetAllOrdersAsync(cancellationToken);
    }
}