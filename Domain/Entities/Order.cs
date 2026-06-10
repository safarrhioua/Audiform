namespace Domain.Entities;

public sealed class Order
{
    public int Id { get; init; }
    public string OrderNumber { get; init; }
    public string? PatientName { get; init; }
    public string PatientNumber { get; init; }
    public DateTime? OrderDate { get; init; }
    public DateTime? DeliveryDate { get; init; }
    public string? Status { get; init; }
}
