using Application.EarpieceTemplates;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Audiform.Server.Controllers;

[ApiController]
[Authorize]
[Route("api/earpiece-templates")]
public sealed class EarpieceTemplatesController(
    IGetAvailableTemplatesService getAvailableTemplatesService,
    ILogger<EarpieceTemplatesController> logger) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<AvailableTemplateDto>>> GetAvailableTemplates(
        CancellationToken cancellationToken)
    {
        logger.LogInformation("Templates ophalen gestart.");

        try
        {
            var templates = await getAvailableTemplatesService.GetAvailableTemplatesAsync(
                cancellationToken);

            logger.LogInformation("Templates succesvol opgehaald. Aantal templates: {TemplateCount}.", templates.Count);

            return Ok(templates);
        }
        catch (UnauthorizedAccessException ex)
        {
            logger.LogWarning(ex, "Gebruiker is niet geautoriseerd om templates op te halen.");
            return Unauthorized();
        }
        catch (InvalidOperationException ex)
        {
            logger.LogWarning(ex, "Gebruiker heeft geen toegang tot templates.");
            return Forbid();
        }
    }

    [HttpGet("{templateId:int}/configuration")]
    public async Task<ActionResult<EarpieceTemplateConfigDto>> GetAvailableTemplateConfig(
        int templateId,
        CancellationToken cancellationToken)
    {
        logger.LogInformation("Template configuratie ophalen gestart voor templateId {TemplateId}.", templateId);

        try
        {
            var templateConfig = await getAvailableTemplatesService.GetAvailableTemplateConfigAsync(
                templateId,
                cancellationToken);

            if (templateConfig is null)
            {
                logger.LogWarning("Geen template configuratie gevonden voor templateId {TemplateId}.", templateId);
                return NotFound();
            }

            logger.LogInformation("Template configuratie succesvol opgehaald voor templateId {TemplateId}.", templateId);

            return Ok(templateConfig);
        }
        catch (UnauthorizedAccessException ex)
        {
            logger.LogWarning(ex, "Gebruiker is niet geautoriseerd om template configuratie op te halen voor templateId {TemplateId}.", templateId);
            return Unauthorized();
        }
        catch (InvalidOperationException ex)
        {
            logger.LogWarning(ex, "Gebruiker heeft geen toegang tot template configuratie voor templateId {TemplateId}.", templateId);
            return Forbid();
        }
    }
}