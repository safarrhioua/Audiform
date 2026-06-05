using Application.Orders;

namespace Application.Interfaces;

public interface IOrderFileStorage
{
    Task<IReadOnlyList<CreateOrderFileData>> SaveFilesAsync(
        int orderId,
        IReadOnlyCollection<OrderUploadFile> files,
        CancellationToken cancellationToken = default);
}
