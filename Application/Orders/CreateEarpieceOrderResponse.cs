namespace Application.Orders;

public sealed record CreateEarpieceOrderResponse(
    int OrderId,
    string ShopOrderId,
    string PatientName,
    string PatientNumber,
    DateTime DeliveryDate,
    string? Remarks,
    string? SendMethod,
    IReadOnlyCollection<string> UploadedFileNames,
    IReadOnlyCollection<CreateOrderSelectionData> Selections);
