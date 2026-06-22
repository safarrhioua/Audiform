using Application.Orders;
using Domain.Entities;

namespace Application.Interfaces;

public interface IOrderRepository
{
    Task<CreateOrderSelectionData> CreateValidatedSelectionDataAsync(
        string earSide,
        int stepId,
        int? optionId,
        string? valueText,
        CancellationToken cancellationToken = default);

    Task<int> CreateOrderAsync(
        CreateOrderData order,
        CancellationToken cancellationToken = default);

    Task AddOrderSelectionsAsync(
        int orderId,
        IReadOnlyCollection<CreateOrderSelectionData> selections,
        CancellationToken cancellationToken = default);

    Task AddOrderFilesAsync(
        int orderId,
        IReadOnlyCollection<CreateOrderFileData> files,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Order>> GetAllOrdersAsync(
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Order>> GetOrdersByUserAsync(
        string userId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Order>> SearchOrdersByUserAsync(
        string userId, string query, CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<Order> Orders, int TotalCount)> GetOrdersByUserPagedAsync(
    string userId, int page, int pageSize, DateTime cutoffDate, CancellationToken cancellationToken = default);
}