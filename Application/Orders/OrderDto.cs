namespace Application.Orders;

public sealed record OrderStateDto(int? Id, string StateName);

public sealed record OrderDto(
    int Id,
    string OrderNumber,
    string? PatientName,
    string PatientNumber,
    DateTime? OrderDate,
    DateTime? DeliveryDate,
    OrderStateDto State
);