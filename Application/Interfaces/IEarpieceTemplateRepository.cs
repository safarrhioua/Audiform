using Domain.Entities;

namespace Application.Interfaces;

public interface IEarpieceTemplateRepository
{
    Task<IReadOnlyList<EarpieceTemplate>> GetAllTemplatesAsync(
        CancellationToken cancellationToken = default);
}
