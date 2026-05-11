namespace Application.Interfaces;

public interface IShopRestrictionRepository
{
    Task<IReadOnlySet<int>> GetBlockedTemplateIdsAsync(
        int shopId,
        CancellationToken cancellationToken = default);
}
