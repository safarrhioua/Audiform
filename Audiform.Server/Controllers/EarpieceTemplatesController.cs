using Application.EarpieceTemplates;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Audiform.Server.Controllers;

[ApiController]
[Authorize]
[Route("api/earpiece-templates")]
public sealed class EarpieceTemplatesController(
    IGetAvailableTemplatesService getAvailableTemplatesService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<AvailableTemplateDto>>> GetAvailableTemplates(
        CancellationToken cancellationToken)
    {
        try
        {
            var templates = await getAvailableTemplatesService.GetAvailableTemplatesAsync(
                cancellationToken);

            return Ok(templates);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized();
        }
        catch (InvalidOperationException)
        {
            return Forbid();
        }
    }
}
