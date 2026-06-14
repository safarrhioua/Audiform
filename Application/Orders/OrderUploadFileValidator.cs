namespace Application.Orders;

public static class OrderUploadFileValidator
{
    private const int MaxFileCount = 4;
    private const long MaxFileSizeInBytes = 10 * 1024 * 1024;

    private static readonly HashSet<string> AllowedContentTypes =
    [
        "image/png",
        "image/jpeg",
        "application/pdf",
    ];

    private static readonly HashSet<string> AllowedExtensions =
    [
        ".png",
        ".jpg",
        ".jpeg",
        ".pdf",
    ];

    public static void Validate(IReadOnlyCollection<OrderUploadFile> files)
    {
        if (files.Count > MaxFileCount)
        {
            throw new ArgumentException("Er mogen maximaal 4 bestanden worden geüpload.");
        }

        foreach (var file in files)
        {
            ValidateFile(file);
        }
    }

    private static void ValidateFile(OrderUploadFile file)
    {
        var fileName = Path.GetFileName(file.OriginalFileName);

        if (file.Length == 0)
        {
            throw new ArgumentException($"Bestand '{fileName}' is leeg.");
        }

        if (file.Length > MaxFileSizeInBytes)
        {
            throw new ArgumentException($"Bestand '{fileName}' is groter dan 10MB.");
        }

        var extension = Path.GetExtension(fileName).ToLowerInvariant();
        var contentType = file.ContentType?.Trim().ToLowerInvariant();

        if (
            !AllowedExtensions.Contains(extension) ||
            string.IsNullOrWhiteSpace(contentType) ||
            !AllowedContentTypes.Contains(contentType)
        )
        {
            throw new ArgumentException(
                $"Bestand '{fileName}' heeft een ongeldig bestandstype. Alleen PNG, JPG, JPEG en PDF zijn toegestaan.");
        }
    }
}
