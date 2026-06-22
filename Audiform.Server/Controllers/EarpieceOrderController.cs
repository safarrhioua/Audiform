using Application.Orders;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Audiform.Server.Controllers;

[ApiController]
[Authorize]
[Route("api/earpiece-order")]
public sealed class EarpieceOrderController(
    ICreateEarpieceOrderService createEarpieceOrderService,
    ILogger<EarpieceOrderController> logger) : ControllerBase
{
    [HttpPost]
    [ValidateAntiForgeryToken]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<CreateEarpieceOrderResponse>> CreateOrder(
        [FromForm] CreateEarpieceOrderFormRequest request,
        CancellationToken cancellationToken)
    {
        logger.LogInformation(
            "Nieuwe oorstukjesbestelling ontvangen. SendMethod: {SendMethod}, Aantal bestanden: {FileCount}.",
            request.SendMethod,
            request.Files.Count);

        try
        {
            var files = request.Files
                .Select(file => new OrderUploadFile(
                    file.FileName,
                    file.ContentType,
                    file.Length,
                    file.OpenReadStream()))
                .ToList();

            logger.LogInformation(
                "Bestanden voorbereid voor bestelling. Aantal bestanden: {FileCount}.",
                files.Count);

            var response = await createEarpieceOrderService.CreateOrderAsync(
                new CreateEarpieceOrderRequest(
                    request.PatientName,
                    request.PatientNumber,
                    request.DeliveryDate,
                    request.Remarks,
                    request.SendMethod,
                    request.SelectionsJson,
                    files),
                cancellationToken);

            logger.LogInformation(
                "Oorstukjesbestelling succesvol aangemaakt. OrderId: {OrderId}, ShopOrderId: {ShopOrderId}.",
                response.OrderId,
                response.ShopOrderId);

            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            logger.LogWarning(ex, "Gebruiker is niet ingelogd of niet geautoriseerd om een bestelling aan te maken.");
            return Unauthorized();
        }
        catch (InvalidOperationException ex)
        {
            logger.LogWarning(ex, "Gebruiker heeft geen toegang om deze bestelling aan te maken.");
            return Forbid();
        }
        catch (ArgumentException exception)
        {
            logger.LogWarning(
                exception,
                "Ongeldige bestelling ontvangen. Foutmelding: {ErrorMessage}",
                exception.Message);

            return BadRequest(new { error = exception.Message });
        }
    }
}

public sealed class CreateEarpieceOrderFormRequest
{
    [FromForm(Name = "patient_name")]
    public string? PatientName { get; init; }

    [FromForm(Name = "patient_number")]
    public string? PatientNumber { get; init; }

    [FromForm(Name = "delivery_date")]
    public DateTime? DeliveryDate { get; init; }

    [FromForm(Name = "remarks")]
    public string? Remarks { get; init; }

    [FromForm(Name = "send_method")]
    public string? SendMethod { get; init; }

    [FromForm(Name = "selections_json")]
    public string? SelectionsJson { get; init; }

    [FromForm(Name = "files")]
    public List<IFormFile> Files { get; init; } = [];
}