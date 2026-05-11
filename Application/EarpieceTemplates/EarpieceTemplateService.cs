using Application.Interfaces;

namespace Application.EarpieceTemplates;

public sealed class EarpieceTemplateService(
    IUserShopContext userShopContext,
    IEarpieceTemplateRepository templateRepository,
    IShopRestrictionRepository restrictionRepository) : IGetAvailableTemplatesService
{
    public async Task<IReadOnlyList<AvailableTemplateDto>> GetAvailableTemplatesAsync(
        CancellationToken cancellationToken = default)
    {
        var shopId = await userShopContext.GetCurrentShopIdAsync(cancellationToken);

        var templates = await templateRepository.GetAllTemplatesAsync(cancellationToken);

        var blockedTemplateIds = await restrictionRepository.GetBlockedTemplateIdsAsync(
            shopId,
            cancellationToken);

        return templates
            .Where(template => !blockedTemplateIds.Contains(template.Id))
            .Select(template => new AvailableTemplateDto(template.Id, template.Name))
            .ToList();
    }
}
