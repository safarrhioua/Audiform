using Application.Interfaces;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Orders;

public interface IGetEmployeeOrdersService
{
    Task<IReadOnlyList<OrderDto>> GetAllOrdersAsync(CancellationToken cancellationToken = default);
}

public sealed class GetEmployeeOrdersService(
    IOrderRepository orderRepository) : IGetEmployeeOrdersService
{
    public async Task<IReadOnlyList<OrderDto>> GetAllOrdersAsync(
        CancellationToken cancellationToken = default)
    {
        var orders = await orderRepository.GetAllOrdersForEmployeeAsync(cancellationToken);

        return orders
            .Select(order => new OrderDto(
                order.Id,
                order.OrderNumber ?? string.Empty,
                order.PatientName,
                order.PatientNumber ?? string.Empty,
                order.OrderDate,
                order.DeliveryDate,
                new OrderStateDto(null, order.Status ?? string.Empty)))
            .ToList();
    }
}