using System;

namespace Application.Orders;

public sealed record OrderDto(
    int Id,
    string? OrderNumber,
    string? PatientName,
    string? PatientNumber,
    DateTime? OrderDate,
    DateTime? DeliveryDate,
    string? Status
);