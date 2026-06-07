namespace Application.Orders;

public interface ICreateEarpieceOrderService
{
    Task<CreateEarpieceOrderResponse> CreateOrderAsync(
        CreateEarpieceOrderRequest request,
        CancellationToken cancellationToken = default);
}
