using Application.Interfaces;

namespace Application.Orders;

public sealed class GetOrdersService(
    IOrderRepository orderRepository) : IGetOrdersService
{
    public async Task<IReadOnlyList<OrderDto>> GetOrdersAsync(
        string userId, CancellationToken cancellationToken = default)
    {
        var orders = await orderRepository.GetOrdersByUserAsync(userId, cancellationToken);

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

    public async Task<IReadOnlyList<OrderDto>> SearchOrdersAsync(
    string userId, string query, CancellationToken cancellationToken = default)
    {
        var orders = await orderRepository.SearchOrdersByUserAsync(userId, query, cancellationToken);

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

    public async Task<PagedResult<OrderDto>> GetOrdersPagedAsync(
    string userId, int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var (orders, totalCount) = await orderRepository.GetOrdersByUserPagedAsync(
            userId, page, pageSize, cancellationToken);

        var items = orders
            .Select(order => new OrderDto(
                order.Id,
                order.OrderNumber,
                order.PatientName,
                order.PatientNumber,
                order.OrderDate,
                order.DeliveryDate,
                new OrderStateDto(null, order.Status ?? string.Empty)))
            .ToList();

        return new PagedResult<OrderDto>(items, totalCount);
    }
}