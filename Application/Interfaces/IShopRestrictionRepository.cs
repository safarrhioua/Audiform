using Domain.Entities;

namespace Application.Interfaces;

public interface IShopRestrictionRepository
{
    Task<IReadOnlySet<int>> GetBlockedTemplateIdsAsync(
        int shopId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<BlockedOption>> GetShopBlockedOptionsAsync(
        int shopId,
        CancellationToken cancellationToken = default);
}
