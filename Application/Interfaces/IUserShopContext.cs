namespace Application.Interfaces;

public interface IUserShopContext
{
    string GetCurrentUserId();

    Task<int> GetCurrentShopIdAsync(CancellationToken cancellationToken = default);
}
