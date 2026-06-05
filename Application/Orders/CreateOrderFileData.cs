namespace Application.Orders;

public sealed record CreateOrderFileData(
    string OriginalFileName,
    string FileName,
    string FilePath,
    string? ContentType,
    long FileSize,
    DateTime UploadedAt);
