namespace Application.Orders;

public sealed record CreateOrderData(
    int ShopEmployeeId,
    string PatientName,
    string PatientNumber,
    string? Remarks,
    DateTime OrderDate,
    DateTime DeliveryDate,
    string Status);
