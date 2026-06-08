namespace Application.Orders;

public sealed record CreateEarpieceOrderRequest(
    string? PatientName,
    string? PatientNumber,
    DateTime? DeliveryDate,
    string? Remarks,
    string? SelectionsJson,
    IReadOnlyCollection<OrderUploadFile> Files);

public sealed record OrderUploadFile(
    string OriginalFileName,
    string? ContentType,
    long Length,
    Stream Content);
