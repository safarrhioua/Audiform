using Application.Interfaces;
using Application.Orders;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;

namespace Infrastructure.Storage;

public sealed class OrderFileStorage(
    IConfiguration configuration,
    IWebHostEnvironment webHostEnvironment) : IOrderFileStorage
{
    public async Task<IReadOnlyList<CreateOrderFileData>> SaveFilesAsync(
        int orderId,
        IReadOnlyCollection<OrderUploadFile> files,
        CancellationToken cancellationToken = default)
    {
        if (files.Count == 0)
        {
            return [];
        }

        var orderDirectory = Path.Combine(GetStorageRootPath(), "orders", orderId.ToString());
        Directory.CreateDirectory(orderDirectory);

        var storedFiles = new List<CreateOrderFileData>();

        foreach (var file in files)
        {
            if (file.Length <= 0)
            {
                continue;
            }

            var originalFileName = Path.GetFileName(file.OriginalFileName);
            var extension = Path.GetExtension(originalFileName);
            var storedFileName = $"{Guid.NewGuid():N}{extension}";
            var storedFilePath = Path.Combine(orderDirectory, storedFileName);

            await using (var outputStream = File.Create(storedFilePath))
            {
                await file.Content.CopyToAsync(outputStream, cancellationToken);
            }

            storedFiles.Add(new CreateOrderFileData(
                originalFileName,
                storedFileName,
                storedFilePath,
                string.IsNullOrWhiteSpace(file.ContentType) ? null : file.ContentType,
                file.Length,
                DateTime.UtcNow));
        }

        return storedFiles;
    }

    private string GetStorageRootPath()
    {
        var configuredRootPath = configuration["OrderFileStorage:RootPath"];

        if (!string.IsNullOrWhiteSpace(configuredRootPath))
        {
            return Path.GetFullPath(configuredRootPath);
        }

        return Path.GetFullPath(Path.Combine(webHostEnvironment.ContentRootPath, "..", "Storage"));
    }
}
