namespace Application.Orders;

public sealed record CreateOrderData(
    int ShopEmployeeId,
    string PatientName,
    string PatientNumber,
    string? Remarks,
    string SendMethod,
    DateTime OrderDate,
    DateTime DeliveryDate,
    string Status);
