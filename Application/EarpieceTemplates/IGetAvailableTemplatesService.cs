namespace Application.EarpieceTemplates;

public interface IGetAvailableTemplatesService
{
    Task<IReadOnlyList<AvailableTemplateDto>> GetAvailableTemplatesAsync(
        CancellationToken cancellationToken = default);
}
