// Application/Orders/PagedResult.cs
namespace Application.Orders;

public sealed record PagedResult<T>(
    IReadOnlyList<T> Items,
    int TotalCount);