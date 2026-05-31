using Application.Interfaces;

namespace Application.Orders;

public sealed class GetOrdersService(
    IOrderRepository orderRepository) : IGetOrdersService
{
    public async Task<IReadOnlyList<OrderDto>> GetOrdersAsync(
        CancellationToken cancellationToken = default)
    {
        var orders = await orderRepository.GetAllOrdersAsync(cancellationToken);

        return orders
    .Select(order => new OrderDto(
        order.Id,
        order.OrderNumber,
        order.PatientName,
        order.PatientNumber,
        order.OrderDate,
        order.DeliveryDate,
        new OrderStateDto(null, order.Status ?? string.Empty)))
    .ToList();
    }
}