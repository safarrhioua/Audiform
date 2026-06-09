using Application.Orders;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Audiform.Server.Controllers;

[ApiController]
[Authorize]
[Route("api/earpiece-order")]
public sealed class EarpieceOrderController(
    ICreateEarpieceOrderService createEarpieceOrderService) : ControllerBase
{
    [HttpPost]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<CreateEarpieceOrderResponse>> CreateOrder(
        [FromForm] CreateEarpieceOrderFormRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var files = request.Files
                .Where(file => file.Length > 0)
                .Select(file => new OrderUploadFile(
                    file.FileName,
                    file.ContentType,
                    file.Length,
                    file.OpenReadStream()))
                .ToList();

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

            return Ok(response);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized();
        }
        catch (InvalidOperationException)
        {
            return Forbid();
        }
        catch (ArgumentException exception)
        {
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
