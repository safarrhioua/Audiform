namespace Application.Interfaces;

public interface IShopEmployeeRepository
{
    Task<int?> GetShopIdByUserIdAsync(string userId, CancellationToken cancellationToken = default);

    Task<int?> GetShopEmployeeIdByUserIdAsync(string userId, CancellationToken cancellationToken = default);
}
