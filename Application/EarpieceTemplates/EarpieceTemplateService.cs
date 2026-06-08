using Application.Interfaces;
using Domain.Entities;

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
            .Select(template => new AvailableTemplateDto(
                template.Id,
                template.Name,
                template.Description,
                template.ImagePath,
                template.Version))
            .ToList();
    }

    public async Task<EarpieceTemplateConfigDto?> GetAvailableTemplateConfigAsync(
        int templateId,
        CancellationToken cancellationToken = default)
    {
        var shopId = await userShopContext.GetCurrentShopIdAsync(cancellationToken);

        var blockedTemplateIds = await restrictionRepository.GetBlockedTemplateIdsAsync(
            shopId,
            cancellationToken);

        if (blockedTemplateIds.Contains(templateId))
        {
            throw new InvalidOperationException(
                $"Template '{templateId}' is blocked for shop '{shopId}'.");
        }

        var templateConfig = await templateRepository.GetConfigByTemplateIdAsync(
            templateId,
            cancellationToken);

        if (templateConfig is null)
        {
            return null;
        }

        var blockedOptions = await restrictionRepository.GetShopBlockedOptionsAsync(
            shopId,
            cancellationToken);

        FilterBlockedOptions(templateConfig.Config, blockedOptions);

        return new EarpieceTemplateConfigDto(
            templateConfig.Id,
            templateConfig.Name,
            templateConfig.Version,
            templateConfig.Config);
    }

    private static void FilterBlockedOptions(
        System.Text.Json.Nodes.JsonNode config,
        IReadOnlyList<BlockedOption> blockedOptions)
    {
        if (blockedOptions.Count == 0 ||
            config["steps"] is not System.Text.Json.Nodes.JsonArray steps)
        {
            return;
        }

        var blockedOptionKeys = blockedOptions
            .Select(blockedOption => (blockedOption.StepId, blockedOption.OptionId))
            .ToHashSet();

        foreach (var step in steps)
        {
            var stepId = GetIntValue(step?["id"]) ?? GetIntValue(step?["stepId"]);
            if (stepId is null ||
                step?["options"] is not System.Text.Json.Nodes.JsonArray options)
            {
                continue;
            }

            for (var index = options.Count - 1; index >= 0; index--)
            {
                var option = options[index];
                var optionId = GetIntValue(option?["id"]) ?? GetIntValue(option?["optionId"]);

                if (optionId is not null &&
                    blockedOptionKeys.Contains((stepId.Value, optionId.Value)))
                {
                    options.RemoveAt(index);
                }
            }
        }
    }

    private static int? GetIntValue(System.Text.Json.Nodes.JsonNode? node)
    {
        if (node is null)
        {
            return null;
        }

        if (node.GetValueKind() == System.Text.Json.JsonValueKind.Number)
        {
            return node.GetValue<int>();
        }

        if (node.GetValueKind() == System.Text.Json.JsonValueKind.String &&
            int.TryParse(node.GetValue<string>(), out var value))
        {
            return value;
        }

        return null;
    }
}
