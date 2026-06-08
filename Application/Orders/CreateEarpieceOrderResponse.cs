namespace Application.Orders;

public sealed record CreateEarpieceOrderResponse(
    int OrderId,
    string ShopOrderId);
