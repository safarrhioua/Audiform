using Domain.Entities;

namespace Application.Interfaces;

public interface IEarpieceTemplateRepository
{
    Task<IReadOnlyList<EarpieceTemplate>> GetAllTemplatesAsync(
        CancellationToken cancellationToken = default);

    Task<EarpieceTemplateConfig?> GetConfigByTemplateIdAsync(
        int templateId,
        CancellationToken cancellationToken = default);
}
